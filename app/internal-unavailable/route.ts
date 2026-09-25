export function GET() {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  })
}
