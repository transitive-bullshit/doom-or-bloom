import { createHash, randomUUID } from 'node:crypto'
import { loadBundle } from '@/lib/content/loader'
import { feedbackInputSchema } from '@/lib/debug/feedback-schema'
import { projectFeedbackStore } from '@/lib/debug/feedback-store'
import {
  localDebugAvailable,
  localFeedbackRequestAllowed
} from '@/lib/debug/local-access'
import { readBoundedJson } from '@/lib/server/limits'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  if (!localDebugAvailable())
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  if (!localFeedbackRequestAllowed(request))
    return Response.json(
      { error: 'Save feedback from the local review page.' },
      { status: 403, headers }
    )
  const parsed = feedbackInputSchema.safeParse(
    await readBoundedJson(request, 100_000).catch(() => null)
  )
  if (!parsed.success)
    return Response.json(
      {
        error:
          'Choose an existing entry and write between 1 and 20,000 characters.'
      },
      { status: 400, headers }
    )
  const input = parsed.data
  const bundle = loadBundle()
  const asset =
    input.kind === 'questions'
      ? bundle.prompts.find((item) => item.id === input.resourceId)
      : bundle.references.find((item) => item.id === input.resourceId)
  if (!asset)
    return Response.json(
      { error: 'That entry is not in the current built-in set.' },
      { status: 400, headers }
    )
  try {
    const entry = await projectFeedbackStore().append(input.kind, {
      id: randomUUID(),
      resourceId: asset.id,
      label: 'text' in asset ? asset.text : asset.title,
      contentVersion: bundle.manifest.contentVersion,
      assetHash: createHash('sha256')
        .update(JSON.stringify(asset))
        .digest('hex'),
      text: input.text,
      createdAt: new Date().toISOString()
    })
    return Response.json({ entry }, { headers })
  } catch {
    return Response.json(
      {
        error:
          'Feedback could not be saved. Your text is still here; check the project feedback file and try again.'
      },
      { status: 500, headers }
    )
  }
}
