import { loadPublished } from '@/lib/assessments/public-server'
export const dynamic = 'force-dynamic'
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const saved = await loadPublished((await params).id)
  return Response.json(saved, {
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      'Content-Disposition': 'attachment; filename="assessment.json"'
    }
  })
}
