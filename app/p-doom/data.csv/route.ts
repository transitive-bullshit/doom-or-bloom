import { loadExamples } from '@/components/landing/data'
import { hubCsv } from '@/lib/p-doom/download'
import { siteUrl } from '@/lib/site'

// The same deployment snapshot and lifetime as the table on /p-doom.
export const dynamic = 'error'
export const revalidate = false

export async function GET() {
  return new Response(hubCsv(await loadExamples(false)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="p-doom-public-statements.csv"',
      Link: `<${siteUrl}/p-doom>; rel="describedby"`
    }
  })
}
