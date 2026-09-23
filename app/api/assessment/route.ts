export async function POST() {
  return Response.json(
    {
      error:
        'This assessment endpoint has been replaced. Start a new assessment from the home page.'
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  )
}
