import { render } from 'takumi-js'
import { cardSchema, ShareCard } from '@/lib/sharing/card'
import { readBoundedJson, limitAssessment } from '@/lib/server/limits'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  try {
    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(request.url).origin)
      return Response.json(
        { error: 'Use the assessment page to download a card.' },
        { status: 403, headers }
      )
    limitAssessment('share-card')
    if (Number(request.headers.get('content-length')) > 2000)
      throw new Error('Invalid card')
    const data = cardSchema.parse(await readBoundedJson(request, 2000))
    const bytes = await render(ShareCard({ data }), {
      width: 1200,
      height: 630,
      format: 'png',
      emoji: 'from-font',
      signal: AbortSignal.timeout(10_000)
    })
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...headers,
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="doom-or-bloom.png"'
      }
    })
  } catch {
    return Response.json(
      { error: 'The card could not be generated. Please try again.' },
      { status: 400, headers }
    )
  }
}
