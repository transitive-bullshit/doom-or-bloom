import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { repository } from '@/lib/assessments/server'
import { AssessmentError } from '@/lib/assessments/contracts'
import { loadPersonaComparisons } from '@/components/landing/data'
import { resultCardData } from '@/lib/sharing/card-data'
import { renderShareCard } from '@/lib/sharing/render-card'
import { limitAssessment } from '@/lib/server/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await params).id)
    const { assessment } = await repository().load(owner, id)
    if (!assessment.result)
      throw new AssessmentError('conflict', 409, 'Results are not ready yet.')
    limitAssessment('share-card')
    const data = resultCardData(
      assessment.result,
      await loadPersonaComparisons()
    )
    const bytes = await renderShareCard(data, { format: 'png' })
    return new Response(new Uint8Array(bytes), {
      headers: { ...privateHeaders, 'Content-Type': 'image/png' }
    })
  })
}
