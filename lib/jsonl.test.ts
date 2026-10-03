import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { readJsonl } from './jsonl'

let directory: string
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'doom-jsonl-'))
})
afterEach(() => rmSync(directory, { recursive: true, force: true }))

async function all<T>(file: string) {
  const out: T[] = []
  for await (const entry of readJsonl<T>(file)) out.push(entry)
  return out
}

test('a missing file has no entries', async () => {
  expect(await all(join(directory, 'missing.jsonl'))).toEqual([])
})

test('reads lines longer than a read chunk, multibyte text, blank lines and a final line without a newline', async () => {
  const file = join(directory, 'plan.jsonl')
  // Far longer than the 64 KiB read chunk, so lines and characters straddle chunks.
  const long = 'é→🌱'.repeat(50_000)
  const lines = [{ id: 'a', long }, { id: 'b' }, { id: 'c', long }]
  writeFileSync(
    file,
    `${JSON.stringify(lines[0])}\n\n${JSON.stringify(lines[1])}\r\n${JSON.stringify(lines[2])}`
  )
  expect(await all(file)).toEqual(lines)
})

test('reads lazily, so a consumer that stops early never parses later lines', async () => {
  const file = join(directory, 'plan.jsonl')
  writeFileSync(file, '{"id":"a"}\n{"id":')
  for await (const entry of readJsonl(file)) {
    expect(entry).toEqual({ id: 'a' })
    break
  }
})

test('a damaged line names the file and line', async () => {
  const file = join(directory, 'plan.jsonl')
  writeFileSync(file, '{"id":"a"}\n\n{"id":')
  await expect(all(file)).rejects.toThrow(`${file}:3:`)
})
