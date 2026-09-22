import { apiDiagnostics } from '@/lib/server/error-reporting'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  localDebugAvailable,
  localWriteRequestAllowed
} from '@/lib/debug/local-access'
import { readBoundedJson, LimitError } from '@/lib/server/limits'
import { fixedUserPersona } from '@/lib/journeys/fixed'
import { personas } from '@/lib/journeys/catalog'
import { runMechanicalSuite } from '@/lib/journeys/mechanical/runner'
import { projectJourneyStore } from '@/lib/journeys/store'
import { runIndex } from '@/lib/journeys/schema'
import { runLiveJourneys } from '@/lib/journeys/live'

export const runtime = 'nodejs'
let running = false
export async function GET(request: Request) {
  const diagnostics = apiDiagnostics(request, '/api/user-journeys')
  const headers = { 'Cache-Control': 'no-store', ...diagnostics.headers }
  if (!localDebugAvailable())
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  const url = new URL(request.url)
  const personaId = url.searchParams.get('persona')
  if (![...personas, fixedUserPersona].some((p) => p.id === personaId))
    return Response.json(
      { error: 'Choose an existing persona' },
      { status: 400, headers }
    )
  try {
    diagnostics.setPhase('read_saved_run')
    const store = projectJourneyStore()
    const suite = await store.read(url.searchParams.get('run') ?? 'baseline')
    return Response.json(
      {
        run: runIndex(suite),
        journey: suite.journeys.find((j) => j.personaId === personaId) ?? null
      },
      { headers }
    )
  } catch (err) {
    diagnostics.report(err, 500)
    return Response.json(
      { error: 'Saved run could not be read. Check its project artifact.' },
      { status: 500, headers }
    )
  }
}
export async function POST(request: Request) {
  const diagnostics = apiDiagnostics(request, '/api/user-journeys')
  const headers = { 'Cache-Control': 'no-store', ...diagnostics.headers }
  if (!localDebugAvailable())
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  if (!localWriteRequestAllowed(request))
    return Response.json(
      { error: 'Rerun from the local User Journeys page.' },
      { status: 403, headers }
    )
  diagnostics.setPhase('parse_input')
  let body: unknown
  try {
    body = await readBoundedJson(request, 2000)
  } catch (err) {
    const status =
      err instanceof LimitError
        ? err.status
        : err instanceof SyntaxError
          ? 400
          : 500
    diagnostics.report(err, status)
    return Response.json(
      { error: 'The journey request could not be read.' },
      { status, headers }
    )
  }
  const input = z
    .strictObject({
      personaId: z.string().optional(),
      mode: z.enum(['live', 'synthetic']),
      allowPaid: z.boolean().optional()
    })
    .safeParse(body)
  if (
    !input.success ||
    (input.data.mode === 'live' && input.data.allowPaid !== true) ||
    (input.data.personaId &&
      !personas.some((p) => p.id === input.data.personaId))
  )
    return Response.json(
      { error: 'Choose an existing persona.' },
      { status: 400, headers }
    )
  if (running)
    return Response.json(
      { error: 'A journey run is already in progress.' },
      { status: 409, headers }
    )
  running = true
  try {
    diagnostics.setPhase('generate_journeys', { mode: input.data.mode })
    const suite =
      input.data.mode === 'live'
        ? await runLiveJourneys({ personaId: input.data.personaId })
        : await runMechanicalSuite({
            id: `${Date.now()}-${randomUUID()}`,
            personaId: input.data.personaId
          })
    diagnostics.setPhase('save_and_list_runs')
    if (input.data.mode === 'synthetic') await projectJourneyStore().save(suite)
    return Response.json(
      { run: runIndex(suite), runs: await projectJourneyStore().list() },
      { headers }
    )
  } catch (err) {
    diagnostics.report(err, 500)
    return Response.json(
      {
        error:
          'Run could not start or be saved. Check server-side API credentials and local artifact storage. Earlier runs remain intact.'
      },
      { status: 500, headers }
    )
  } finally {
    running = false
  }
}
