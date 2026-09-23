import { apiDiagnostics } from '@/lib/server/error-reporting'
import { ZodError } from 'zod'
import { cardSchema } from '@/lib/sharing/card'
import { renderShareCard } from '@/lib/sharing/render-card'
import {
  readBoundedJson,
  limitAssessment,
  LimitError
} from '@/lib/server/limits'
import { isSameOriginRequest } from '@/lib/server/request-origin'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  const diagnostics = apiDiagnostics(request, '/api/share-card')
  const headers = { 'Cache-Control': 'no-store', ...diagnostics.headers }
  let inputValidated = false
  try {
    if (!isSameOriginRequest(request))
      return Response.json(
        { error: 'Use the assessment page to download a card.' },
        { status: 403, headers }
      )
    diagnostics.setPhase('parse_input')
    limitAssessment('share-card')
    if (Number(request.headers.get('content-length')) > 2000)
      throw Object.assign(new LimitError('Invalid card'), { status: 413 })
    const data = cardSchema.parse(await readBoundedJson(request, 2000))
    inputValidated = true
    diagnostics.setPhase('render_card')
    const bytes = await renderShareCard(data, { format: 'png' })
    diagnostics.setPhase('serialize_response')
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="doom-or-bloom.png"'
      }
    })
  } catch (err) {
    const status =
      err instanceof LimitError
        ? err.status
        : !inputValidated &&
            (err instanceof ZodError || err instanceof SyntaxError)
          ? 400
          : 500
    diagnostics.report(err, status)
    return Response.json(
      { error: 'The card could not be generated. Please try again.' },
      { status, headers }
    )
  }
}
