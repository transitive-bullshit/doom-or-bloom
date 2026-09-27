import { assessmentSchema } from '@/lib/assessment/schema'
import { experimentCandidates } from '@/lib/assessment/worldview-experiment'
import {
  agreementAspects,
  agreementPayloadSchema,
  selfPlacementPayloadSchema
} from '@/lib/assessments/feedback'
import type {
  AgreementPayload,
  SelfPlacementPayload
} from '@/lib/assessments/feedback'
import { logit, mean, median, seededRandom, within2x } from './metrics'
import { shownResult } from './shown'

// A human-in-the-loop review of real participant feedback: aggregates to look
// for disagreement patterns across many people, plus a sample of individual
// disagreements to read. Read-only; nothing here calls a model or network.

/** One feedback row with the snapshot whose result the participant rated. */
export type FeedbackRow = {
  id: string
  assessment_id: string
  kind: string
  evidence_revision: number
  algorithm_version: string
  payload: unknown
  created_at: Date | string
  snapshot: unknown
  has_result: boolean
  current_evidence_revision: number | null
}

export async function loadFeedback(
  db: {
    query: (text: string, values: unknown[]) => Promise<{ rows: FeedbackRow[] }>
  },
  since: string | null = null
) {
  const { rows } = await db.query(
    `select f.id, f.assessment_id, f.kind, f.evidence_revision,
       f.algorithm_version, f.payload, f.created_at,
       s.payload as snapshot, s.has_result,
       current.evidence_revision as current_evidence_revision
     from assessment_feedback f
     join assessments a on a.id = f.assessment_id and a.origin = 'participant'
     join assessment_snapshots s
       on s.assessment_id = f.assessment_id and s.id = f.snapshot_id
     left join assessment_snapshots current
       on current.assessment_id = a.id and current.id = a.current_snapshot_id
     where $1::timestamptz is null or f.created_at >= $1::timestamptz
     order by f.created_at, f.id`,
    [since]
  )
  return rows
}

/**
 * The displayed result: recorded in the rating when available, otherwise
 * recomputed from the rated snapshot with today's presentation.
 */
type Displayed = {
  x: number | null
  y: number | null
  pdoom: number | null
  pdoomLabel: string | null
  pdoomSource: string | null
  recordedAtRating: boolean
}

export type FeedbackRecord = {
  id: string
  assessmentId: string
  evidenceRevision: number
  algorithmVersion: string
  createdAt: string
  /** The participant answered again after rating this result. */
  continued: boolean
  selfPlacement: SelfPlacementPayload | null
  agreement: AgreementPayload | null
  shown: Displayed | null
  answerWords: number[]
  transcript: Array<{
    question: string
    replies: Array<{ text: string; disposition: string }>
  }>
  statedPdoom: Array<{
    token: string
    low: number
    high: number
    sentence: string
  }>
}

// A percentage in a sentence about catastrophe; candidates for manual review,
// as in the audit's hand-checked stated-P(doom) pass.
const doomContext =
  /doom|extinct|wipe[sd]? (?:us|out)|kill (?:us|everyone|all)|catastroph|existential|end of (?:the world|humanity|civilization)|disempower|take ?over|destroy/i

export function feedbackRecord(row: FeedbackRow): FeedbackRecord {
  const state = assessmentSchema.parse(row.snapshot)
  const result = row.has_result ? state.result : null
  const agreement =
    row.kind === 'agreement' ? agreementPayloadSchema.parse(row.payload) : null
  const recomputed = result ? shownResult(result) : null
  const recorded = agreement?.shown
  const candidates = experimentCandidates({
    completeParticipantEvidence: state.answers.map((answer) => ({
      id: answer.id,
      prompt: answer.promptText,
      answer: answer.text,
      correctionTarget: null
    })),
    activeSupport: []
  })
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    evidenceRevision: row.evidence_revision,
    algorithmVersion: row.algorithm_version,
    createdAt: new Date(row.created_at).toISOString(),
    continued: (row.current_evidence_revision ?? 0) > row.evidence_revision,
    selfPlacement:
      row.kind === 'self_placement'
        ? selfPlacementPayloadSchema.parse(row.payload)
        : null,
    agreement,
    shown: recorded
      ? {
          ...recorded,
          pdoomSource: recomputed?.pdoomSource ?? null,
          recordedAtRating: true
        }
      : recomputed && {
          x: recomputed.x,
          y: recomputed.y,
          pdoom: recomputed.pdoom,
          pdoomLabel: recomputed.pdoomToken,
          pdoomSource: recomputed.pdoomSource,
          recordedAtRating: false
        },
    answerWords: state.answers.map(
      (answer) => answer.text.split(/\s+/).filter(Boolean).length
    ),
    // Like conversationTurns: rejected replies first, then the accepted answer.
    transcript: state.prompts.map((prompt) => {
      const answer = state.answers.find((a) => a.promptInstanceId === prompt.id)
      return {
        question: answer?.promptText ?? prompt.text,
        replies: [
          ...state.interactionHistory
            .filter((reply) => reply.promptInstanceId === prompt.id)
            .map(({ text, disposition }) => ({ text, disposition })),
          ...(answer ? [{ text: answer.text, disposition: 'usable' }] : [])
        ]
      }
    }),
    statedPdoom: Object.values(candidates.probabilities).flatMap((quote) =>
      quote.bounds && quote.token && doomContext.test(quote.text)
        ? [
            {
              token: quote.token,
              low: quote.bounds[0],
              high: quote.bounds[1],
              sentence: quote.text
            }
          ]
        : []
    )
  }
}

const lengthBucket = (words: number[]) => {
  const typical = median(words)
  return typical === null
    ? 'no accepted answers'
    : typical < 10
      ? 'under 10 words'
      : typical < 50
        ? '10–49 words'
        : '50+ words'
}

const outlookRegion = (x: number | null) =>
  x === null
    ? 'unplaced'
    : x < 0.2
      ? 'strongly concerned (x < 0.2)'
      : x < 0.4
        ? 'leans concerned (0.2–0.4)'
        : x <= 0.6
          ? 'mixed (0.4–0.6)'
          : x <= 0.8
            ? 'leans hopeful (0.6–0.8)'
            : 'strongly hopeful (x > 0.8)'

const placementGap = (feedback: SelfPlacementPayload, axis: 'x' | 'y') => {
  const placed = feedback.placed[axis]
  return placed === null ? null : placed - feedback.guess[axis]
}

/** A result counts as disagreed with when rated "not quite" or placed far away. */
const disagreementGap = 0.25

function agreementRate(records: FeedbackRecord[]) {
  const ratings = records.flatMap((r) => (r.agreement ? [r.agreement] : []))
  const notQuite = ratings.filter((a) => a.rating === 'not_quite').length
  return {
    n: ratings.length,
    yes: ratings.length - notQuite,
    notQuite,
    rate: ratings.length ? (ratings.length - notQuite) / ratings.length : null
  }
}

function breakdown<T>(
  records: FeedbackRecord[],
  key: (record: FeedbackRecord) => string,
  summarize: (records: FeedbackRecord[]) => T
) {
  const groups = new Map<string, FeedbackRecord[]>()
  for (const record of records)
    groups.set(key(record), [...(groups.get(key(record)) ?? []), record])
  return Object.fromEntries(
    [...groups]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, members]) => [name, summarize(members)])
  )
}

function placementErrors(records: FeedbackRecord[], axis: 'x' | 'y') {
  const gaps = records.flatMap((r) => {
    const gap = r.selfPlacement ? placementGap(r.selfPlacement, axis) : null
    return gap === null ? [] : [gap]
  })
  const absolute = gaps.map(Math.abs)
  return {
    n: gaps.length,
    // Signed: positive means the answers placed them higher than they did.
    meanSigned: mean(gaps),
    meanAbsolute: mean(absolute),
    medianAbsolute: median(absolute),
    beyond02: gaps.length
      ? absolute.filter((gap) => gap > 0.2).length / gaps.length
      : null
  }
}

/** Aggregates plus a seeded sample of disagreements for manual reading. */
export function auditFeedback(
  records: FeedbackRecord[],
  { sample = 40, seed = 1 }: { sample?: number; seed?: number } = {}
) {
  const bucket = (r: FeedbackRecord) => lengthBucket(r.answerWords)
  const region = (r: FeedbackRecord) => outlookRegion(r.shown?.x ?? null)
  const notQuite = records.flatMap((r) =>
    r.agreement?.rating === 'not_quite' ? [r.agreement] : []
  )
  // One entry per rated result, however many kinds of feedback it received.
  const results = new Map<string, FeedbackRecord[]>()
  for (const record of records) {
    const key = `${record.assessmentId}:${record.evidenceRevision}`
    results.set(key, [...(results.get(key) ?? []), record])
  }
  const displayed = (group: FeedbackRecord[]) =>
    group.find((r) => r.shown?.recordedAtRating)?.shown ?? group[0]!.shown
  const stated = [...results.values()].filter((g) => g[0]!.statedPdoom.length)
  const shownVsStated = stated.map((group) => {
    const statement = group[0]!.statedPdoom.at(-1)!
    const shown = displayed(group)?.pdoom ?? null
    return {
      shown,
      source: displayed(group)?.pdoomSource ?? null,
      error:
        shown === null
          ? null
          : Math.abs(logit(shown) - logit((statement.low + statement.high) / 2))
    }
  })
  const disagreements = [...results.values()].filter((group) =>
    group.some(
      (r) =>
        r.agreement?.rating === 'not_quite' ||
        (r.selfPlacement &&
          (['x', 'y'] as const).some(
            (axis) =>
              Math.abs(placementGap(r.selfPlacement!, axis) ?? 0) >
              disagreementGap
          ))
    )
  )
  const random = seededRandom(seed)
  for (let i = disagreements.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[disagreements[i], disagreements[j]] = [
      disagreements[j]!,
      disagreements[i]!
    ]
  }
  const summary = {
    feedback: {
      rows: records.length,
      agreement: records.filter((r) => r.agreement).length,
      selfPlacement: records.filter((r) => r.selfPlacement).length,
      ratedResults: results.size,
      assessments: new Set(records.map((r) => r.assessmentId)).size,
      continuedAfterRating: records.filter((r) => r.continued).length,
      shownRecordedAtRating: records.filter((r) => r.shown?.recordedAtRating)
        .length
    },
    agreement: {
      overall: agreementRate(records),
      byAnswerLength: breakdown(records, bucket, agreementRate),
      byOutlook: breakdown(records, region, agreementRate),
      byAlgorithm: breakdown(records, (r) => r.algorithmVersion, agreementRate)
    },
    aspects: {
      notQuite: notQuite.length,
      withComment: notQuite.filter((a) => a.comment).length,
      counts: Object.fromEntries(
        agreementAspects.map((aspect) => [
          aspect,
          notQuite.filter((a) => a.aspects.includes(aspect)).length
        ])
      )
    },
    selfPlacement: {
      x: placementErrors(records, 'x'),
      y: placementErrors(records, 'y'),
      byAnswerLength: breakdown(records, bucket, (group) => ({
        x: placementErrors(group, 'x'),
        y: placementErrors(group, 'y')
      }))
    },
    statedPdoom: {
      resultsWithStatement: stated.length,
      shownAsStated: shownVsStated.filter((s) => s.source === 'stated').length,
      shownWithin2x: shownVsStated.filter(
        (s) => s.error !== null && s.error <= within2x
      ).length,
      notShown: shownVsStated.filter((s) => s.shown === null).length
    },
    disagreements: {
      total: disagreements.length,
      sampled: Math.min(sample, disagreements.length)
    }
  }
  return {
    summary,
    sample: disagreements
      .slice(0, sample)
      .map((group) => ({ records: group, shown: displayed(group) }))
  }
}
export type FeedbackAudit = ReturnType<typeof auditFeedback>

const f = (value: number | null, digits = 2) =>
  value === null ? '–' : value.toFixed(digits)
const count = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`
const pct = (value: number | null) =>
  value === null ? '–' : `${Math.round(value * 100)}%`
const table = (headers: string[], rows: Array<Array<string | number>>) =>
  [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`)
  ].join('\n')

/** Aggregate tables only: no participant text. */
export function renderSummary(
  summary: FeedbackAudit['summary'],
  title: string
) {
  const rates = (groups: Record<string, ReturnType<typeof agreementRate>>) =>
    table(
      ['Group', 'Ratings', 'Yes', 'Not quite', 'Agreement'],
      Object.entries(groups).map(([name, r]) => [
        name,
        r.n,
        r.yes,
        r.notQuite,
        pct(r.rate)
      ])
    )
  const errors = (name: string, e: ReturnType<typeof placementErrors>) => [
    name,
    e.n,
    f(e.meanSigned),
    f(e.meanAbsolute),
    f(e.medianAbsolute),
    pct(e.beyond02)
  ]
  const { feedback, agreement, aspects, selfPlacement, statedPdoom } = summary
  return [
    `# ${title}`,
    '',
    `${count(feedback.rows, 'feedback entry', 'feedback entries')} on ${count(feedback.ratedResults, 'rated result')} from ${count(feedback.assessments, 'participant assessment')}: ${count(feedback.agreement, 'agreement rating')} and ${count(feedback.selfPlacement, 'self-placement')}. ${count(feedback.continuedAfterRating, 'entry was', 'entries were')} followed by further answers. Displayed values were recorded at rating time for ${feedback.shownRecordedAtRating} and recomputed from the rated snapshot for the rest.`,
    '',
    'Look for patterns across many participants; a single rating is weak evidence. Agreement is not correctness, and disagreement can also mean the participant’s self-image differs from what they wrote.',
    '',
    '## Agreement',
    '',
    rates({ overall: agreement.overall }),
    '',
    '### By answer length (median words per accepted answer)',
    '',
    rates(agreement.byAnswerLength),
    '',
    '### By displayed outlook',
    '',
    rates(agreement.byOutlook),
    '',
    '### By algorithm version',
    '',
    rates(agreement.byAlgorithm),
    '',
    `## What is off ("not quite": ${aspects.notQuite}, ${aspects.withComment} with a comment)`,
    '',
    table(
      ['Aspect', 'Count'],
      Object.entries(aspects.counts).map(([aspect, count]) => [aspect, count])
    ),
    '',
    '## Self-placement vs displayed point',
    '',
    'Error is the displayed coordinate minus the participant’s guess (positive: the answers placed them further right or higher).',
    '',
    table(
      [
        'Axis',
        'n',
        'Mean signed',
        'Mean |error|',
        'Median |error|',
        'Beyond 0.2'
      ],
      [
        errors('x (outlook)', selfPlacement.x),
        errors('y (scale)', selfPlacement.y),
        ...Object.entries(selfPlacement.byAnswerLength).flatMap(([name, e]) => [
          errors(`x, ${name}`, e.x),
          errors(`y, ${name}`, e.y)
        ])
      ]
    ),
    '',
    '## Stated vs shown P(doom)',
    '',
    `${statedPdoom.resultsWithStatement} rated results contain a percentage in a sentence about catastrophe (pattern matches, not verified statements; sampled disagreements quote them, and /admin shows the rest). ${statedPdoom.shownAsStated} were shown as stated, ${statedPdoom.shownWithin2x} within about 2× of the statement, and ${statedPdoom.notShown} without a P(doom).`,
    ''
  ].join('\n')
}

/** The sampled disagreements with their exact transcripts. Private. */
export function renderDisagreements(sample: FeedbackAudit['sample']) {
  return [
    '# Sampled disagreements',
    '',
    'Private participant text: keep this file local and do not paste it into external services.',
    ...sample.flatMap(({ records: group, shown }, i) => {
      const first = group[0]!
      return [
        '',
        `## ${i + 1}. Assessment ${first.assessmentId}, evidence revision ${first.evidenceRevision}`,
        '',
        `Algorithm ${first.algorithmVersion}; rated ${first.createdAt}${first.continued ? '; answered again afterwards' : ''}.`,
        '',
        `Shown${shown?.recordedAtRating ? ' (recorded at rating)' : ' (recomputed from the rated snapshot)'}: x ${f(shown?.x ?? null)}, y ${f(shown?.y ?? null)}, P(doom) ${shown?.pdoomLabel ?? '–'}${shown?.pdoomSource ? ` (${shown.pdoomSource})` : ''}.`,
        ...group.flatMap((r) => [
          ...(r.agreement
            ? [
                `Agreement: ${r.agreement.rating}${r.agreement.aspects.length ? ` (${r.agreement.aspects.join(', ')})` : ''}${r.agreement.comment ? `: “${r.agreement.comment}”` : ''}.`
              ]
            : []),
          ...(r.selfPlacement
            ? [
                `Self-placement: guessed x ${f(r.selfPlacement.guess.x)}, y ${f(r.selfPlacement.guess.y)}; placed x ${f(r.selfPlacement.placed.x)}, y ${f(r.selfPlacement.placed.y)}.`
              ]
            : [])
        ]),
        ...(first.statedPdoom.length
          ? [
              `Stated P(doom) candidates: ${first.statedPdoom.map((s) => `“${s.sentence}”`).join('; ')}`
            ]
          : []),
        '',
        ...first.transcript.flatMap((turn, n) => [
          `**Q${n + 1}. ${turn.question}**`,
          '',
          ...(turn.replies.length
            ? turn.replies.map(
                (reply) =>
                  `> ${reply.text.replace(/\n+/g, ' ')}${reply.disposition === 'usable' ? '' : ` _(not accepted: ${reply.disposition})_`}`
              )
            : ['> _(unanswered)_']),
          ''
        ])
      ]
    })
  ].join('\n')
}
