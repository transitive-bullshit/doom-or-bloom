import { expect, test } from 'vitest'
import { tweetIdFromUrl } from './tweet-url'

test('recognizes tweet permalinks without treating profiles or lookalike hosts as tweets', () => {
  for (const url of [
    'https://x.com/sama/status/2098811563415150910?s=20',
    'https://twitter.com/sama/status/2098811563415150910/photo/1',
    'https://mobile.twitter.com/sama/status/2098811563415150910',
    'https://x.com/i/web/status/2098811563415150910'
  ])
    expect(tweetIdFromUrl(url)).toBe('2098811563415150910')
  for (const url of [
    'https://x.com/sama',
    'https://x.com/sama/status/not-a-post',
    'https://x.com.example.org/sama/status/123',
    'not a URL',
    'https://example.org/?url=https://x.com/sama/status/123'
  ])
    expect(tweetIdFromUrl(url)).toBeNull()
})
