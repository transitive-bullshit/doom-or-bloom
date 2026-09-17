import { expect, test } from 'vitest'
import { readBoundedJson, runLimited } from './limits'
test('uncertain request retries share one evaluation and reject changed payloads', async () => {
  let calls = 0
  const task = async () => {
    calls++
    return { accepted: true }
  }
  const [a, b] = await Promise.all([
    runLimited('limits-test', { revision: 1 }, task),
    runLimited('limits-test', { revision: 1 }, task)
  ])
  expect(a).toEqual(b)
  expect(calls).toBe(1)
  await expect(
    runLimited('limits-test', { revision: 2 }, task)
  ).rejects.toThrow('different')
})
test('size limits apply even when content length is absent', async () => {
  await expect(
    readBoundedJson(
      new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ text: 'oversize' })
      }),
      8
    )
  ).rejects.toThrow('large')
})
