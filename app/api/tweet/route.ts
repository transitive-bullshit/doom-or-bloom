import { apiDiagnostics } from '@/lib/server/error-reporting'
import { getTweet } from 'react-tweet/api'

export async function GET(request: Request) {
  const diagnostics = apiDiagnostics(request, '/api/tweet')
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^\d{1,25}$/.test(id))
    return Response.json(
      { data: null },
      { status: 400, headers: diagnostics.headers }
    )
  try {
    diagnostics.setPhase('fetch_tweet')
    const data = await getTweet(id, { signal: AbortSignal.timeout(8000) })
    diagnostics.setPhase('serialize_response')
    return Response.json(
      { data: data ?? null },
      {
        headers: {
          ...diagnostics.headers,
          'Cache-Control': data
            ? 'public, max-age=3600, s-maxage=86400'
            : 'public, max-age=60'
        }
      }
    )
  } catch (err) {
    diagnostics.report(err, 502)
    return Response.json(
      { data: null },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store', ...diagnostics.headers }
      }
    )
  }
}
