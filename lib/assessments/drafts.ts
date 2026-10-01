import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { brotliCompressSync, brotliDecompressSync } from 'node:zlib'
import { z } from 'zod'
import {
  defaultLocale,
  localizedPath,
  locales,
  type Locale
} from '@/i18n/config'
import { assessmentSchema } from '../assessment/schema'
import { createAssessment } from '../assessment/state'
import { AssessmentError } from './contracts'
import { repository } from './server'
import type { OwnedAssessment } from './repository'

export const draftApiCookie = 'assessment-draft-api'
export const draftCookieOptions = (id: string) => ({
  path: `/assessments/${id}`,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 365 * 24 * 60 * 60
})

/**
 * The owner page has a URL in every locale (`/assessments/<id>`,
 * `/es/assessments/<id>`), and a cookie path matches only one of them, so the
 * ticket is set once per locale. Names differ because a response can set each
 * cookie name only once.
 */
export const draftPageCookies = (id: string) =>
  locales.map((locale) => ({
    name: draftCookieName(locale),
    options: {
      ...draftCookieOptions(id),
      path: localizedPath(`/assessments/${id}`, locale)
    }
  }))
export const draftCookieName = (locale: Locale) =>
  locale === defaultLocale ? 'assessment-draft' : `assessment-draft-${locale}`
const ticketSchema = z.object({
  owner: z.string(),
  expires: z.number(),
  assessment: assessmentSchema
})
function sign(value: string) {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET is required')
  return createHmac('sha256', secret)
    .update(`assessment-draft:${value}`)
    .digest()
}
// The page ticket is set once per enabled locale, so its size multiplies:
// a Brotli-compressed payload (marked `~`) keeps ten locales' start response
// near 10 KB rather than 22 KB, under common 16 KB header limits. Tickets
// issued before compression stay readable.
const compressed = '~'
export function reserveDraft(owner: string, requestKey: string, model: string) {
  // Stable across uncertain start retries, with no reservation row.
  const hex = sign(`${owner}:${requestKey}`).toString('hex')
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
  const assessment = createAssessment(id, model)
  const payload =
    compressed +
    brotliCompressSync(
      JSON.stringify({
        owner,
        assessment,
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000
      })
    ).toString('base64url')
  return { id, ticket: `${payload}.${sign(payload).toString('base64url')}` }
}
function readDraftTicket(owner: string, id: string, ticket?: string | null) {
  const missing = () =>
    new AssessmentError('not_found', 404, 'Assessment not found.')
  if (!ticket || ticket.length > 8000) throw missing()
  const [payload, signature, extra] = ticket.split('.')
  if (!payload || !signature || extra) throw missing()
  const supplied = Buffer.from(signature, 'base64url')
  const expected = sign(payload)
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    throw missing()
  const bytes = payload.startsWith(compressed)
    ? brotliDecompressSync(Buffer.from(payload.slice(1), 'base64url'))
    : Buffer.from(payload, 'base64url')
  const parsed = ticketSchema.safeParse(JSON.parse(bytes.toString()))
  if (
    !parsed.success ||
    parsed.data.owner !== owner ||
    parsed.data.assessment.id !== id ||
    parsed.data.expires < Date.now()
  )
    throw missing()
  return parsed.data.assessment
}
export async function loadAssessmentOrDraft(
  owner: string,
  id: string,
  ticket?: string | null
): Promise<OwnedAssessment> {
  try {
    return await repository().load(owner, id)
  } catch (err) {
    if (!(err instanceof AssessmentError) || err.status !== 404) throw err
    const assessment = readDraftTicket(owner, id, ticket)
    // A first submission may have committed between the two reads.
    // Reload it, or preserve the 404 if this ID has since been deleted.
    if (await repository().draftWasUsed(id)) return repository().load(owner, id)
    return {
      assessment,
      unsaved: true,
      visibility: 'private',
      isFork: false,
      inheritedPromptCount: 0,
      promptCeiling: assessment.promptCeiling!,
      operation: null
    }
  }
}
