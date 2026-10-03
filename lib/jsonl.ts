import { createReadStream, existsSync } from 'node:fs'

const newline = 0x0a

function parse<T>(file: string, line: number, bytes: Buffer): T | undefined {
  const text = bytes.toString('utf8')
  if (!text.trim()) return undefined
  try {
    return JSON.parse(text) as T
  } catch (err) {
    throw new Error(
      `${file}:${line}: ${err instanceof Error ? err.message : 'invalid JSON'}`
    )
  }
}

// Streams a JSON Lines file one entry at a time, so a file of any size reads in
// memory bounded by its longest line. A missing file has no entries and blank
// lines are skipped. Lines split on the newline byte, which never occurs inside
// a multibyte UTF-8 character.
export async function* readJsonl<T>(file: string): AsyncGenerator<T> {
  if (!existsSync(file)) return
  let pending: Buffer[] = []
  let line = 0
  for await (const chunk of createReadStream(file) as AsyncIterable<Buffer>) {
    let start = 0
    for (
      let end = chunk.indexOf(newline);
      end !== -1;
      end = chunk.indexOf(newline, start)
    ) {
      const entry = parse<T>(
        file,
        ++line,
        Buffer.concat([...pending, chunk.subarray(start, end)])
      )
      pending = []
      start = end + 1
      if (entry !== undefined) yield entry
    }
    if (start < chunk.length) pending.push(chunk.subarray(start))
  }
  const last = parse<T>(file, ++line, Buffer.concat(pending))
  if (last !== undefined) yield last
}
