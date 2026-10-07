import { versions } from '@/lib/assessment/schema'
import type { Interview, JobRecord, Step } from './interview'
import {
  bootstrapCi,
  errorSummary,
  logit,
  mean,
  median,
  pdoomDifference,
  pdoomError,
  retest,
  within2x
} from './metrics'
import { findPersona } from './personas'
import { briefHash, referenceKinds, referencePoint } from './references'
import type { Point, ReferenceStore } from './references'
import { shownPdoom } from './shown'

const noReference: Point = { x: null, y: null, pdoom: null }
const words = (step: Step) =>
  (step.replies.at(-1)?.text ?? '').split(/\s+/).filter(Boolean).length
const logOdds = (p: number | null) => (p === null ? null : logit(p))

/**
 * The result a participant sees: the automatic result, else the last result
 * they could have asked for (the interview reached its answer limit first).
 */
export function resultStep(interview: Interview) {
  return interview.autoStopAt === null
    ? interview.steps.findLast((step) => step.shown)
    : interview.steps.find(
        (step) =>
          step.answers === interview.autoStopAt &&
          step.shownFrom === 'automatic'
      )
}

type Row = { record: JobRecord; step: Step | undefined; reference: Point }

function accuracy(rows: Array<{ step: Step | undefined; reference: Point }>) {
  const shown = rows.map((row) => row.step?.shown ?? null)
  const errors = rows.map((row, i) =>
    pdoomError(shownPdoom(shown[i]), row.reference.pdoom)
  )
  return {
    x: {
      placed: shown.filter((s) => s?.x != null).length,
      ...errorSummary(
        rows.map((row, i) => [shown[i]?.x ?? null, row.reference.x])
      )
    },
    y: {
      placed: shown.filter((s) => s?.y != null).length,
      ...errorSummary(
        rows.map((row, i) => [shown[i]?.y ?? null, row.reference.y])
      )
    },
    // P(doom) errors are absolute log-odds: 0.7 is about a factor of two.
    pdoom: {
      shown: shown.filter((s) => shownPdoom(s) !== null).length,
      stated: shown.filter(
        (s) =>
          s?.pdoomSource === 'stated' || s?.pdoomSource === 'public-statement'
      ).length,
      ...errorSummary(
        rows.map((row, i) => [
          pdoomDifference(shownPdoom(shown[i]), row.reference.pdoom),
          0
        ])
      ),
      within2x: errors.filter((e) => e !== null && e <= within2x).length
    }
  }
}

function segment(rows: Row[]) {
  const complete = rows.filter((row) => row.record.status === 'complete')
  const interviews = complete.map((row) => row.record.interview)
  const results = interviews.map((i) => i.autoStopAt)
  const ready = interviews.map((i) => i.firstReadyAt)
  return {
    interviews: rows.length,
    failed: rows.length - complete.length,
    wordsPerAnswer: median(
      interviews.flatMap((i) => i.steps.filter((s) => s.accepted).map(words))
    ),
    rejectedReplies: interviews.reduce(
      (sum, i) =>
        sum +
        i.steps.reduce(
          (inner, s) => inner + s.replies.length - Number(s.accepted),
          0
        ),
      0
    ),
    answersToResult: {
      median: median(results),
      mean: mean(results),
      withoutResult: results.filter((n) => n === null).length
    },
    firstReady: {
      median: median(ready),
      never: ready.filter((n) => n === null).length
    },
    ...accuracy(complete)
  }
}
export type Segment = ReturnType<typeof segment>

function groupBy(rows: Row[], key: (row: Row) => string) {
  const groups = new Map<string, Row[]>()
  for (const row of rows)
    groups.set(key(row), [...(groups.get(key(row)) ?? []), row])
  return Object.fromEntries(
    [...groups].map(([name, members]) => [name, segment(members)])
  )
}

/** Accuracy against the store's references for one run's job records. */
export function scoreRun(
  plan: {
    id: string
    set: string
    maxAnswers: number
    versions: typeof versions
  },
  records: JobRecord[],
  store: ReferenceStore
) {
  const references = (record: JobRecord) => store.personas[record.job.persona]
  const rows: Row[] = records.map((record) => ({
    record,
    step: resultStep(record.interview),
    reference: references(record)
      ? referencePoint(references(record)!, 'consensus')
      : noReference
  }))
  const personas = [...new Set(records.map((r) => r.job.persona))].sort()
  const stale = personas.flatMap((id) =>
    (['r1', 'r2', 'r3'] as const).flatMap((kind) => {
      const reference = store.personas[id]?.[kind]
      return reference && reference.briefHash !== briefHash(findPersona(id))
        ? [`${id} ${kind}`]
        : []
    })
  )
  const complete = rows.filter((row) => row.record.status === 'complete')
  const byAnswer = Array.from({ length: plan.maxAnswers }, (_, i) => {
    const at = complete.flatMap((row) => {
      const step = row.record.interview.steps.find(
        (s) => s.answers === i + 1 && s.accepted && s.shown
      )
      return step ? [{ step, reference: row.reference }] : []
    })
    const { x, y, pdoom } = accuracy(at)
    return {
      answers: i + 1,
      n: at.length,
      x: x.mae,
      y: y.mae,
      pdoom: pdoom.mae,
      within2x: pdoom.within2x
    }
  }).filter((point) => point.n > 0)
  const byReference = Object.fromEntries(
    referenceKinds.map((kind) => {
      const { x, y, pdoom } = accuracy(
        complete.map((row) => ({
          step: row.step,
          reference: references(row.record)
            ? referencePoint(references(row.record)!, kind)
            : noReference
        }))
      )
      return [kind, { x, y, pdoom }]
    })
  )
  const repeats = new Map<string, Row[]>()
  for (const row of complete) {
    const key = `${row.record.job.persona}__${row.record.job.style}`
    repeats.set(key, [...(repeats.get(key) ?? []), row])
  }
  const retestOf = (value: (row: Row) => number | null) =>
    retest(
      [...repeats.values()].map((group) =>
        group.map(value).filter((v): v is number => v !== null)
      )
    )
  return {
    run: {
      id: plan.id,
      set: plan.set,
      versions: plan.versions,
      scoredWith: versions,
      scoredAt: new Date().toISOString()
    },
    references: {
      consensus: 'mean of R2 (judge) and R3 (self-placement)',
      missing: personas.filter(
        (id) =>
          !store.personas[id] ||
          referencePoint(store.personas[id], 'consensus').x === null
      ),
      stale,
      r1Versions: [
        ...new Set(
          personas.flatMap((id) => {
            const key = store.personas[id]?.r1?.provenance
            return key
              ? [store.provenance[key]?.versions.assessment ?? '?']
              : []
          })
        )
      ]
    },
    overall: segment(rows),
    byStyle: groupBy(rows, (row) => row.record.job.style),
    byGroup: groupBy(rows, (row) => row.record.job.group),
    byAnswer,
    byReference,
    retest: {
      x: retestOf((row) => row.step?.shown?.x ?? null),
      y: retestOf((row) => row.step?.shown?.y ?? null),
      pdoom: retestOf((row) => logOdds(row.step?.shown?.pdoom ?? null))
    }
  }
}
export type Score = ReturnType<typeof scoreRun>

/**
 * Paired comparison of two runs of the same interviews (b minus a): error
 * differences with seeded percentile-bootstrap 95% intervals, as in the audit.
 */
export function compareRuns(
  a: JobRecord[],
  b: JobRecord[],
  store: ReferenceStore,
  options: { reps?: number; seed?: number } = {}
) {
  const complete = (records: JobRecord[]) =>
    new Map(
      records
        .filter((record) => record.status === 'complete')
        .map((record) => [record.job.key, record])
    )
  const left = complete(a)
  const right = complete(b)
  const pairs = [...left.keys()]
    .filter((key) => right.has(key))
    .sort()
    .map((key) => {
      const entry = store.personas[left.get(key)!.job.persona]
      return {
        style: left.get(key)!.job.style,
        a: left.get(key)!.interview,
        b: right.get(key)!.interview,
        reference: entry ? referencePoint(entry, 'consensus') : noReference
      }
    })
  type Measure = (interview: Interview, reference: Point) => number | null
  const shownError =
    (axis: 'x' | 'y'): Measure =>
    (interview, reference) => {
      const value = resultStep(interview)?.shown?.[axis] ?? null
      return value === null || reference[axis] === null
        ? null
        : Math.abs(value - reference[axis])
    }
  const pdoom: Measure = (interview, reference) =>
    pdoomError(shownPdoom(resultStep(interview)?.shown), reference.pdoom)
  const summarize = (subset: typeof pairs) => {
    const paired = (measure: Measure) => {
      const values = subset.map(
        (pair) =>
          [
            measure(pair.a, pair.reference),
            measure(pair.b, pair.reference)
          ] as const
      )
      const diffs = values.flatMap(([before, after]) =>
        before === null || after === null ? [] : [after - before]
      )
      return {
        a: mean(values.map((v) => v[0])),
        b: mean(values.map((v) => v[1])),
        n: diffs.length,
        diff: mean(diffs),
        ci: bootstrapCi(diffs, options),
        better: diffs.filter((d) => d < -1e-9).length,
        worse: diffs.filter((d) => d > 1e-9).length
      }
    }
    const within = (side: 'a' | 'b') =>
      subset.filter(
        (p) => (pdoom(p[side], p.reference) ?? Infinity) <= within2x
      ).length
    return {
      pairs: subset.length,
      x: paired(shownError('x')),
      y: paired(shownError('y')),
      pdoom: paired(pdoom),
      answersToResult: paired((interview) => interview.autoStopAt),
      within2x: { a: within('a'), b: within('b') },
      withoutResult: {
        a: subset.filter((p) => p.a.autoStopAt === null).length,
        b: subset.filter((p) => p.b.autoStopAt === null).length
      }
    }
  }
  const styles = [...new Set(pairs.map((pair) => pair.style))].sort()
  return {
    unpaired: left.size + right.size - 2 * pairs.length,
    overall: summarize(pairs),
    byStyle: Object.fromEntries(
      styles.map((style) => [
        style,
        summarize(pairs.filter((pair) => pair.style === style))
      ])
    )
  }
}
export type Comparison = ReturnType<typeof compareRuns>

const f = (value: number | null | undefined, digits = 3) =>
  value === null || value === undefined ? '–' : value.toFixed(digits)
const table = (headers: string[], rows: Array<Array<string | number>>) =>
  [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`)
  ].join('\n')

function segmentRows(segments: Record<string, Segment>) {
  return table(
    [
      'Segment',
      'Interviews',
      'Words/answer',
      'Answers to result',
      'No result',
      'First ready',
      'x error (bias)',
      'y error (bias)',
      'P(doom) log-odds error (bias)',
      'P(doom) shown',
      'Within ~2×',
      'Stated'
    ],
    Object.entries(segments).map(([name, s]) => [
      name,
      s.failed ? `${s.interviews} (${s.failed} failed)` : s.interviews,
      f(s.wordsPerAnswer, 0),
      `${f(s.answersToResult.median, 1)} (mean ${f(s.answersToResult.mean, 1)})`,
      s.answersToResult.withoutResult,
      `${f(s.firstReady.median, 1)}${s.firstReady.never ? ` (${s.firstReady.never} never)` : ''}`,
      `${f(s.x.mae)} (${f(s.x.bias)}), n=${s.x.n}`,
      `${f(s.y.mae)} (${f(s.y.bias)}), n=${s.y.n}`,
      `${f(s.pdoom.mae, 2)} (${f(s.pdoom.bias, 2)}), n=${s.pdoom.n}`,
      s.pdoom.shown,
      s.pdoom.within2x,
      s.pdoom.stated
    ])
  )
}

export function renderScore(score: Score) {
  const { run, references, retest: variability } = score
  return [
    `# Benchmark score: ${run.id}`,
    '',
    `Set \`${run.set}\`; algorithm ${run.versions.assessment}, content ${run.versions.content}, model ${run.versions.model}. Scored ${run.scoredAt}.`,
    '',
    `Errors compare what the participant is shown (the automatic result, else the last available result) with the ${references.consensus}. Map errors are mean absolute error on 0–1; P(doom) error is mean absolute log-odds error, where 0.7 is about a factor of two. These are comparisons between designs, not absolute accuracy.`,
    ...(references.missing.length
      ? ['', `No consensus reference: ${references.missing.join(', ')}.`]
      : []),
    ...(references.stale.length
      ? [
          '',
          `Built from an older brief (rebuild with \`pnpm benchmark:refs\`): ${references.stale.join(', ')}.`
        ]
      : []),
    '',
    '## Overall, by style and by group',
    '',
    segmentRows({
      overall: score.overall,
      ...Object.fromEntries(
        Object.entries(score.byStyle).map(([k, v]) => [`style: ${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(score.byGroup).map(([k, v]) => [`group: ${k}`, v])
      )
    }),
    '',
    '## Accuracy by answer count',
    '',
    'Results shown after each accepted answer (automatic or on request). Interviews that stopped earlier drop out unless the run continued after results.',
    '',
    table(
      ['Answers', 'n', 'x error', 'y error', 'P(doom) error', 'Within ~2×'],
      score.byAnswer.map((p) => [
        p.answers,
        p.n,
        f(p.x),
        f(p.y),
        f(p.pdoom, 2),
        p.within2x
      ])
    ),
    '',
    '## Against each reference',
    '',
    `R1 is the engine reading the whole brief (built with algorithm ${references.r1Versions.join(', ') || '–'}); R2 the judge; R3 self-placement; R4 public P(doom) statements.`,
    '',
    table(
      [
        'Reference',
        'x error (n)',
        'y error (n)',
        'P(doom) error (n)',
        'Within ~2×'
      ],
      Object.entries(score.byReference).map(([kind, r]) => [
        kind.toUpperCase(),
        `${f(r.x.mae)} (${r.x.n})`,
        `${f(r.y.mae)} (${r.y.n})`,
        `${f(r.pdoom.mae, 2)} (${r.pdoom.n})`,
        r.pdoom.within2x
      ])
    ),
    '',
    '## Retest variability',
    '',
    variability.x || variability.y || variability.pdoom
      ? table(
          ['Output', 'Personas', 'Within-person SD', 'ICC', 'Max range'],
          Object.entries(variability).map(([axis, r]) => [
            axis === 'pdoom' ? 'P(doom) (log-odds)' : axis,
            r?.personas ?? 0,
            f(r?.withinSd),
            f(r?.icc, 2),
            f(r?.maxRange, 2)
          ])
        )
      : 'No repeated interviews in this run (use the `retest` set or `--repeats`).',
    ''
  ].join('\n')
}

export function renderComparison(
  comparison: Comparison,
  ids: { a: string; b: string }
) {
  const rows = (name: string, s: Comparison['overall']) =>
    (['x', 'y', 'pdoom', 'answersToResult'] as const).map((measure) => {
      const m = s[measure]
      const digits = measure === 'x' || measure === 'y' ? 3 : 2
      return [
        name,
        measure,
        f(m.a, digits),
        f(m.b, digits),
        m.n,
        m.diff === null ? '–' : `${m.diff >= 0 ? '+' : ''}${f(m.diff, digits)}`,
        m.ci ? `[${f(m.ci[0], digits)}, ${f(m.ci[1], digits)}]` : '–',
        `${m.better} / ${m.worse}`
      ]
    })
  return [
    `# Benchmark comparison: ${ids.b} vs ${ids.a}`,
    '',
    `Paired by persona, style and repeat (${comparison.overall.pairs} pairs; ${comparison.unpaired} unpaired interviews ignored). Differences are ${ids.b} minus ${ids.a}: negative errors and fewer answers are improvements. Intervals are seeded percentile-bootstrap 95% CIs of the mean paired difference. "Lower / higher" counts pairs where ${ids.b} is lower or higher.`,
    '',
    table(
      [
        'Segment',
        'Measure',
        ids.a,
        ids.b,
        'Pairs',
        'Difference',
        '95% CI',
        'Lower / higher'
      ],
      [
        ...rows('overall', comparison.overall),
        ...Object.entries(comparison.byStyle).flatMap(([style, s]) =>
          rows(style, s)
        )
      ]
    ),
    '',
    `P(doom) within ~2×: ${comparison.overall.within2x.a} → ${comparison.overall.within2x.b}. Interviews without an automatic result: ${comparison.overall.withoutResult.a} → ${comparison.overall.withoutResult.b}.`,
    ''
  ].join('\n')
}
