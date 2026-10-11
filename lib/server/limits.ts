import { limits } from '@/lib/assessment/schema'
const rates = new Map<string, { count: number; expires: number }>()
export class LimitError extends Error {
  status = 429
}
export async function readBoundedJson(
  request: Request,
  maximum = limits.requestBytes as number
) {
  const declared = Number(request.headers.get('content-length') || 0)
  if (declared > maximum)
    throw new LimitError('This assessment record is too large')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('A request body is required')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximum) {
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
export function limitAssessment(id: string) {
  rate(`assessment:${id}`, 20)
}
