import { expect, test } from 'vitest'
import {
  agreementAspects,
  agreementPayloadSchema,
  feedbackItemSchema,
  feedbackRequestSchema,
  resultPlacement,
  selfPlacementPayloadSchema,
  type AgreementAspect,
  type AgreementPayload,
  type FeedbackItem,
  type FeedbackRequest,
  type SelfPlacementPayload
} from './feedback'

const guess = {
  kind: 'self_placement',
  evidenceRevision: 3,
  guess: { x: 0.25, y: 1 }
} satisfies FeedbackRequest
const correction = {
  kind: 'agreement',
  evidenceRevision: 3,
  rating: 'not_quite',
  aspects: ['outlook_too_doom', 'pdoom_too_high']
} satisfies FeedbackRequest
const valid = (body: unknown) => feedbackRequestSchema.safeParse(body).success

test('self-placement requests carry only an in-range guess', () => {
  expect(feedbackRequestSchema.parse(guess)).toEqual(guess)
  expect(valid({ ...guess, guess: { x: 0, y: 0 } })).toBe(true)
  for (const point of [
    { x: -0.01, y: 0.5 },
    { x: 0.5, y: 1.01 },
    { x: 0.5 },
    { x: '0.5', y: 0.5 },
    { x: 0.5, y: 0.5, z: 0 }
  ])
    expect(valid({ ...guess, guess: point })).toBe(false)
  // The placed point is computed by the server, never accepted from a client.
  expect(valid({ ...guess, placed: { x: 0.5, y: 0.5 } })).toBe(false)
  expect(valid({ ...guess, rating: 'yes' })).toBe(false)
})

test('requests require a known kind and a nonnegative integer revision', () => {
  for (const evidenceRevision of [-1, 1.5, '3', null, undefined])
    expect(valid({ ...guess, evidenceRevision })).toBe(false)
  expect(valid({ ...guess, kind: 'placement' })).toBe(false)
  expect(valid({ evidenceRevision: 3, guess: guess.guess })).toBe(false)
})

test('agreement aspects describe only a "Not quite" rating', () => {
  expect(feedbackRequestSchema.parse(correction)).toEqual(correction)
  expect(valid({ ...correction, rating: 'not_quite', aspects: [] })).toBe(true)
  expect(valid({ ...correction, rating: 'yes', aspects: [] })).toBe(true)
  expect(valid({ ...correction, rating: 'yes' })).toBe(false)
  expect(valid({ ...correction, rating: 'maybe', aspects: [] })).toBe(false)
  expect(
    valid({ ...correction, aspects: ['outlook_too_doom', 'unknown'] })
  ).toBe(false)
  expect(valid({ ...correction, aspects: undefined })).toBe(false)
})

test('agreement aspects are unique and bounded by the aspect list', () => {
  const all: AgreementAspect[] = [...agreementAspects]
  expect(valid({ ...correction, aspects: all })).toBe(true)
  expect(valid({ ...correction, aspects: [...all, 'other'] })).toBe(false)
  expect(
    valid({ ...correction, aspects: ['scale_too_low', 'scale_too_low'] })
  ).toBe(false)
})

test('agreement comments are optional, trimmed and 1–1000 characters', () => {
  const parse = (comment: unknown) =>
    feedbackRequestSchema.safeParse({ ...correction, comment })
  expect(parse('  Too gloomy about jobs \n').data).toMatchObject({
    comment: 'Too gloomy about jobs'
  })
  expect(parse(` ${'a'.repeat(1000)} `).success).toBe(true)
  for (const comment of ['', '   \n', 'a'.repeat(1001), null, 42])
    expect(parse(comment).success).toBe(false)
  expect(
    feedbackRequestSchema.safeParse({
      ...correction,
      rating: 'yes',
      aspects: [],
      comment: 'Spot on'
    }).success
  ).toBe(true)
})

test('stored payloads and response items use the same rules', () => {
  const placement: SelfPlacementPayload = {
    guess: { x: 0.2, y: 0.8 },
    placed: { x: 0.35, y: null }
  }
  const agreement: AgreementPayload = { rating: 'yes', aspects: [] }
  expect(selfPlacementPayloadSchema.parse(placement)).toEqual(placement)
  expect(agreementPayloadSchema.parse(agreement)).toEqual(agreement)
  expect(
    agreementPayloadSchema.safeParse({ rating: 'yes', aspects: ['other'] })
      .success
  ).toBe(false)
  const now = new Date().toISOString()
  const saved: FeedbackItem = {
    kind: 'self_placement',
    evidenceRevision: 3,
    payload: placement,
    createdAt: now,
    updatedAt: now
  }
  expect(feedbackItemSchema.parse(saved)).toEqual(saved)
  expect(
    feedbackItemSchema.safeParse({ ...saved, kind: 'agreement' }).success
  ).toBe(false)
  expect(
    feedbackItemSchema.safeParse({ ...saved, createdAt: 'yesterday' }).success
  ).toBe(false)
})

test('the placed point matches the map, including an unplaced axis', () => {
  const result = {
    evidenceRevision: 4,
    horizontal: { value: 0.3 },
    experiment: { evidenceRevision: 4, transformation: { value: 0.7 } }
  }
  expect(resultPlacement(result)).toEqual({ x: 0.3, y: 0.7 })
  expect(
    resultPlacement({
      ...result,
      experiment: { ...result.experiment, evidenceRevision: 3 }
    })
  ).toEqual({ x: 0.3, y: null })
  expect(resultPlacement({ ...result, horizontal: { value: null } })).toEqual({
    x: null,
    y: 0.7
  })
  expect(
    resultPlacement({ evidenceRevision: 4, horizontal: { value: 0.3 } })
  ).toEqual({ x: 0.3, y: null })
})
