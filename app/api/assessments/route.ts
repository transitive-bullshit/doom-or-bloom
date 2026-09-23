import { cookies } from 'next/headers'
import {
  reserveDraft,
  draftCookie,
  draftApiCookie,
  draftCookieOptions
} from '@/lib/assessments/drafts'
import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { repository } from '@/lib/assessments/server'
import { readBoundedJson } from '@/lib/server/limits'
import { serverEnv } from '@/lib/server/env'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return privateRequest(request, async (owner) =>
    Response.json(await repository().list(owner), { headers: privateHeaders })
  )
}
export async function POST(request: Request) {
  return privateRequest(request, async (owner) => {
    const input = z
      .strictObject({
        requestKey: z.string().min(1).max(120),
        onlyIfEmpty: z.boolean().default(false)
      })
      .parse(await readBoundedJson(request, 2048))
    if (input.onlyIfEmpty && (await repository().list(owner)).length) {
      return Response.json({ id: null }, { headers: privateHeaders })
    }
    const draft = reserveDraft(owner, input.requestKey, serverEnv().model)
    const cookieStore = await cookies()
    cookieStore.set(draftCookie, draft.ticket, draftCookieOptions(draft.id))
    cookieStore.set(draftApiCookie, draft.ticket, {
      ...draftCookieOptions(draft.id),
      path: `/api/assessments/${draft.id}`
    })
    return Response.json({ id: draft.id }, { headers: privateHeaders })
  })
}
