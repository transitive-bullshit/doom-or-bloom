import { ImageResponse } from 'takumi-js/response'
import { loadPublished } from '@/lib/assessments/public-server'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const saved = await loadPublished((await params).id)
  const response = new ImageResponse(
    SocialCard({
      assessment: { title: saved.title, result: saved.assessment.result! }
    }),
    socialImageOptions
  )
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex')
  return response
}
