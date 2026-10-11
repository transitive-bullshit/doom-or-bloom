import { expect, test } from 'vitest'
import { readBoundedJson } from './limits'
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
