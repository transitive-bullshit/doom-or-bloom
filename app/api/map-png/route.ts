import { resultMapExport } from '@/lib/sharing/map-layout'
import { render } from 'takumi-js'
import { z, ZodError } from 'zod'
import { apiDiagnostics } from '@/lib/server/error-reporting'
import { isSameOriginRequest } from '@/lib/server/request-origin'
import {
  LimitError,
  limitAssessment,
  readBoundedJson
} from '@/lib/server/limits'

export const runtime = 'nodejs'
const inputSchema = z.strictObject({
  svg: z.string().max(2_000_000).startsWith('<svg')
})

export async function POST(request: Request) {
  const diagnostics = apiDiagnostics(request, '/api/map-png')
  const headers = { 'Cache-Control': 'no-store', ...diagnostics.headers }
  let inputValidated = false
  try {
    if (!isSameOriginRequest(request))
      return Response.json(
        { error: 'Export from the assessment page.' },
        { status: 403, headers }
      )
    diagnostics.setPhase('parse_input')
    limitAssessment('map-png')
    const { svg } = inputSchema.parse(await readBoundedJson(request, 2_100_000))
    // Render as a self-contained image, never as executable HTML or remote resources.
    if (
      /<!|<script|<foreignObject/i.test(svg) ||
      /(?:href\s*=\s*["'])(?!#|data:image\/(?:png|jpeg|webp);base64,)/i.test(
        svg
      ) ||
      [...svg.matchAll(/url\(([^)]*)\)/gi)].some(
        (match) =>
          !/^#[\w:-]+$/.test(match[1]!.replace(/&quot;|["']/g, '').trim())
      )
    )
      return Response.json(
        {
          error:
            'The graph must contain only embedded images and local references.'
        },
        { status: 400, headers }
      )
    inputValidated = true
    diagnostics.setPhase('render_map', { svgBytes: Buffer.byteLength(svg) })
    const bytes = await render(
      {
        type: 'image',
        src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
        style: resultMapExport
      },
      {
        devicePixelRatio: 2,
        format: 'png',
        signal: AbortSignal.timeout(10_000)
      }
    )
    return new Response(new Uint8Array(bytes), {
      headers: { ...headers, 'Content-Type': 'image/png' }
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
      { error: 'The graph could not be exported. Please try again.' },
      { status, headers }
    )
  }
}
