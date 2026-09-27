import { expect, test } from 'vitest'
import { rootPrompt } from '@/lib/assessment/schema'
import { createAssessment } from '@/lib/assessment/state'
import {
  auditFeedback,
  feedbackRecord,
  renderDisagreements,
  renderSummary
} from './feedback-audit'
import type { FeedbackRecord } from './feedback-audit'

test('a feedback row becomes a record with the rated transcript and what was shown', () => {
  const state = createAssessment('00000000-0000-4000-8000-000000000001')
  const prompt = state.prompts[0]!
  state.evidenceRevision = 1
  state.answers = [
    {
      id: `${prompt.id}:a`,
      promptInstanceId: prompt.id,
      promptText: rootPrompt,
      text: 'Bad for jobs. Honestly a 20% chance AI wipes us out.',
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    }
  ]
  state.interactionHistory = [
    {
      requestId: 'r1',
      promptInstanceId: prompt.id,
      text: 'idk',
      disposition: 'needs_clarification'
    }
  ]
  const row = {
    id: 'f1',
    assessment_id: state.id,
    kind: 'agreement',
    evidence_revision: 1,
    algorithm_version: '0.7.0',
    payload: {
      rating: 'not_quite',
      aspects: ['pdoom_too_low'],
      comment: 'I said 20%',
      shown: { x: 0.3, y: 0.6, pdoom: 0.05, pdoomLabel: 'under 10%' }
    },
    created_at: new Date('2026-09-28T12:00:00Z'),
    snapshot: state,
    has_result: false,
    current_evidence_revision: 2
  }
  expect(feedbackRecord(row)).toMatchObject({
    createdAt: '2026-09-28T12:00:00.000Z',
    continued: true,
    selfPlacement: null,
    agreement: { rating: 'not_quite', aspects: ['pdoom_too_low'] },
    shown: {
      x: 0.3,
      pdoom: 0.05,
      pdoomLabel: 'under 10%',
      pdoomSource: null,
      recordedAtRating: true
    },
    answerWords: [11],
    transcript: [
      {
        question: rootPrompt,
        replies: [
          { text: 'idk', disposition: 'needs_clarification' },
          { text: state.answers[0]!.text, disposition: 'usable' }
        ]
      }
    ],
    statedPdoom: [
      {
        token: '20%',
        low: 0.2,
        high: 0.2,
        sentence: 'Honestly a 20% chance AI wipes us out.'
      }
    ]
  })
  // Payloads are parsed with the shared feedback contract.
  expect(() =>
    feedbackRecord({ ...row, payload: { rating: 'yes', aspects: ['other'] } })
  ).toThrow()
})

let next = 0
const record = (overrides: Partial<FeedbackRecord>): FeedbackRecord => ({
  id: `f${++next}`,
  assessmentId: `a${next}`,
  evidenceRevision: 1,
  algorithmVersion: '0.7.0',
  createdAt: '2026-09-28T00:00:00.000Z',
  continued: false,
  selfPlacement: null,
  agreement: null,
  shown: {
    x: 0.3,
    y: 0.6,
    pdoom: 0.1,
    pdoomLabel: '≈10%',
    pdoomSource: 'inferred',
    recordedAtRating: false
  },
  answerWords: [5, 8, 12],
  transcript: [
    {
      question: 'Q',
      replies: [{ text: 'private answer', disposition: 'usable' }]
    }
  ],
  statedPdoom: [],
  ...overrides
})
const records = [
  record({ agreement: { rating: 'yes', aspects: [] } }),
  record({
    agreement: {
      rating: 'not_quite',
      aspects: ['outlook_too_doom', 'pdoom_too_low'],
      comment: 'private comment'
    },
    answerWords: [60, 80],
    continued: true,
    statedPdoom: [{ token: '20%', low: 0.2, high: 0.2, sentence: 'private' }]
  }),
  record({
    agreement: { rating: 'yes', aspects: [] },
    algorithmVersion: '0.6.1',
    answerWords: [20, 30]
  }),
  record({
    assessmentId: 'shared',
    selfPlacement: { guess: { x: 0.5, y: 0.5 }, placed: { x: 0.2, y: 0.6 } }
  }),
  record({
    assessmentId: 'shared',
    agreement: { rating: 'yes', aspects: [] }
  }),
  record({
    selfPlacement: { guess: { x: 0.4, y: 0.4 }, placed: { x: 0.45, y: null } },
    shown: {
      x: 0.45,
      y: null,
      pdoom: 0.2,
      pdoomLabel: '20%',
      pdoomSource: 'stated',
      recordedAtRating: false
    },
    statedPdoom: [{ token: '20%', low: 0.2, high: 0.2, sentence: 'private' }]
  })
]

test('feedback aggregates by answer length, outlook and algorithm', () => {
  const { summary } = auditFeedback(records)
  expect(summary.feedback).toEqual({
    rows: 6,
    agreement: 4,
    selfPlacement: 2,
    ratedResults: 5,
    assessments: 5,
    continuedAfterRating: 1,
    shownRecordedAtRating: 0
  })
  expect(summary.agreement.overall).toEqual({
    n: 4,
    yes: 3,
    notQuite: 1,
    rate: 0.75
  })
  expect(summary.agreement.byAnswerLength).toEqual({
    '10–49 words': { n: 1, yes: 1, notQuite: 0, rate: 1 },
    '50+ words': { n: 1, yes: 0, notQuite: 1, rate: 0 },
    'under 10 words': { n: 2, yes: 2, notQuite: 0, rate: 1 }
  })
  expect(summary.agreement.byAlgorithm['0.6.1']).toMatchObject({ n: 1, yes: 1 })
  expect(
    summary.agreement.byOutlook['leans concerned (0.2–0.4)']
  ).toMatchObject({
    n: 4
  })
  expect(summary.aspects).toMatchObject({
    notQuite: 1,
    withComment: 1,
    counts: { outlook_too_doom: 1, pdoom_too_low: 1, scale_too_high: 0 }
  })
  // Placed minus guessed: x −0.3 and +0.05; y +0.1 (the other y is unplaced).
  expect(summary.selfPlacement.x).toEqual({
    n: 2,
    meanSigned: expect.closeTo(-0.125),
    meanAbsolute: expect.closeTo(0.175),
    medianAbsolute: expect.closeTo(0.175),
    beyond02: 0.5
  })
  expect(summary.selfPlacement.y).toMatchObject({
    n: 1,
    meanSigned: expect.closeTo(0.1)
  })
  expect(summary.statedPdoom).toEqual({
    resultsWithStatement: 2,
    shownAsStated: 1,
    shownWithin2x: 1,
    notShown: 0
  })
})

test('disagreements group feedback per rated result and sample reproducibly', () => {
  const audit = auditFeedback(records)
  // The "not quite" rating, and the far self-placement with its "yes" rating.
  expect(audit.summary.disagreements).toEqual({ total: 2, sampled: 2 })
  expect(
    audit.sample.map((item) => item.records.length).sort((a, b) => a - b)
  ).toEqual([1, 2])
  expect(auditFeedback(records).sample).toEqual(audit.sample)
  expect(auditFeedback(records, { sample: 1 }).sample).toHaveLength(1)
  const packet = renderDisagreements(audit.sample)
  expect(packet).toContain('private comment')
  expect(packet).toContain('> private answer')
})

test('aggregate output never includes participant text', () => {
  const { summary } = auditFeedback(records)
  const text = `${JSON.stringify(summary)}\n${renderSummary(summary, 'Test')}`
  expect(text).not.toContain('private')
  expect(renderSummary(summary, 'Test')).toContain(
    '| overall | 4 | 3 | 1 | 75% |'
  )
})
