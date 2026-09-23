import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { assessmentSchema } from '../assessment/schema'
import { createAssessment } from '../assessment/state'
import { AssessmentError } from './contracts'
import { repository } from './server'
import type { OwnedAssessment } from './repository'

export const draftCookie = 'assessment-draft'
export const draftApiCookie = 'assessment-draft-api'
export const draftCookieOptions = (id: string) => ({
  path: `/assessments/${id}`,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 365 * 24 * 60 * 60
})
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
export function reserveDraft(owner: string, requestKey: string, model: string) {
  // Stable across uncertain start retries, with no reservation row.
  const hex = sign(`${owner}:${requestKey}`).toString('hex')
  const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
  const assessment = createAssessment(id, model)
  const payload = Buffer.from(
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
  const parsed = ticketSchema.safeParse(
    JSON.parse(Buffer.from(payload, 'base64url').toString())
  )
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
