import { getTweet } from 'react-tweet/api'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^\d{1,25}$/.test(id))
    return Response.json({ data: null }, { status: 400 })
  try {
    const data = await getTweet(id, { signal: AbortSignal.timeout(8000) })
    return Response.json(
      { data: data ?? null },
      {
        headers: {
          'Cache-Control': data
            ? 'public, max-age=3600, s-maxage=86400'
            : 'public, max-age=60'
        }
      }
    )
  } catch {
    return Response.json(
      { data: null },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
