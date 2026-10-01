import { expect, test } from 'vitest'
import {
  shareLinkIdSchema,
  shareLinkRequestSchema,
  sharerNameSchema
} from './share-links'

test('share link IDs are 16 URL-safe characters', () => {
  expect(shareLinkIdSchema.safeParse('AbCdEfGh_jKl-123').success).toBe(true)
  for (const id of ['short', 'AbCdEfGh_jKl-1234', 'AbCdEfGh/jKl-123', ''])
    expect(shareLinkIdSchema.safeParse(id).success).toBe(false)
})

test('a sharer name is a first name in any script, never a URL or handle', () => {
  for (const name of [
    'Alex',
    'Mary-Jane',
    'O’Brien',
    'Jean Luc',
    'Zoë',
    'सीमा',
    '美咲'
  ])
    expect(sharerNameSchema.safeParse(name).success).toBe(true)
  for (const name of [
    'evil.com',
    'https://x.com',
    '@alex',
    'Alex2',
    'a'.repeat(41),
    'Alex  Smith',
    '-Alex'
  ])
    expect(sharerNameSchema.safeParse(name).success).toBe(false)
})

test('an empty name means none, and the request accepts nothing else', () => {
  expect(shareLinkRequestSchema.parse({}).name).toBeNull()
  expect(shareLinkRequestSchema.parse({ name: '' }).name).toBeNull()
  expect(shareLinkRequestSchema.parse({ name: '  Alex ' }).name).toBe('Alex')
  expect(
    shareLinkRequestSchema.safeParse({ name: 'Alex', assessmentId: 'x' })
      .success
  ).toBe(false)
})
