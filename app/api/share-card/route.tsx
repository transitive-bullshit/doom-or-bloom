import { people } from '@/components/landing/people'
import { loadSocialPortrait } from '@/lib/sharing/portraits'
import { apiDiagnostics } from '@/lib/server/error-reporting'
import { ZodError } from 'zod'
import { render } from 'takumi-js'
import { cardSchema, ShareCard } from '@/lib/sharing/card'
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
    const selected = data.closestPersonaIds.map((id) => {
      const person = people.find((person) => person.id === id)
      if (!person)
        throw Object.assign(new LimitError('Unknown persona'), { status: 400 })
      return person
    })
    inputValidated = true
    diagnostics.setPhase('render_card')
    const matches = await Promise.all(
      selected.map(async ({ id, name, avatar }) => ({
        id,
        name,
        portrait: await loadSocialPortrait(avatar)
      }))
    )
    const bytes = await render(cardLayout(data, matches), {
      devicePixelRatio: 2,
      format: 'png',
      emoji: 'from-font',
      signal: AbortSignal.timeout(10_000)
    })
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

function cardLayout(
  data: Parameters<typeof ShareCard>[0]['data'],
  matches: Parameters<typeof ShareCard>[0]['matches']
) {
  return (
    <div style={{ width: 1200, height: 630, display: 'flex' }}>
      {ShareCard({
        data,
        matches,
        date: data?.generatedAt
          ? new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC'
            }).format(new Date(data.generatedAt))
          : undefined
      })}
    </div>
  )
}
