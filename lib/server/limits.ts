import { createHash } from 'node:crypto'
import { limits } from '@/lib/assessment/schema'
const requests = new Map<
  string,
  {
    hash: string
    promise: Promise<unknown>
    timer: ReturnType<typeof setTimeout>
  }
>()
const rates = new Map<string, { count: number; expires: number }>()
let active = 0
export class LimitError extends Error {
  status = 429
}
export async function readBoundedJson(request: Request) {
  const declared = Number(request.headers.get('content-length') || 0)
  if (declared > limits.requestBytes)
    throw new LimitError('This assessment record is too large')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('A request body is required')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limits.requestBytes) {
      await reader.cancel()
      throw new LimitError('This assessment record is too large')
    }
    chunks.push(value)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}
function rate(key: string, maximum: number) {
  const now = Date.now()
  for (const [id, record] of rates) if (record.expires <= now) rates.delete(id)
  const record = rates.get(key) ?? { count: 0, expires: now + 60_000 }
  if (record.count >= maximum)
    throw new LimitError(
      'A few too many requests. Please wait a minute and try again.'
    )
  record.count++
  rates.set(key, record)
}
export function runLimited<T>(
  id: string,
  payload: unknown,
  task: () => Promise<T>
): Promise<T> {
  const hash = createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
  const existing = requests.get(id)
  if (existing) {
    if (existing.hash !== hash)
      return Promise.reject(
        new Error('A request identifier was reused with a different operation')
      )
    return existing.promise as Promise<T>
  }
  rate('global', 80)
  if (requests.size >= 32 || active >= 4)
    throw new LimitError(
      'The local evaluator is busy. Please try again shortly.'
    )
  active++
  const promise = task()
    .finally(() => {
      active--
    })
    .catch((err: unknown) => {
      const record = requests.get(id)
      if (record) clearTimeout(record.timer)
      requests.delete(id)
      throw err
    })
  const timer = setTimeout(() => requests.delete(id), 120_000)
  timer.unref()
  requests.set(id, { hash, promise, timer })
  return promise
}
export function limitAssessment(id: string) {
  rate(`assessment:${id}`, 20)
}
