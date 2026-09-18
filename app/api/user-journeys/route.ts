import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  localDebugAvailable,
  localFeedbackRequestAllowed
} from '@/lib/debug/local-access'
import { readBoundedJson } from '@/lib/server/limits'
import { personas } from '@/lib/journeys/catalog'
import { runJourneySuite } from '@/lib/journeys/runner'
import { projectJourneyStore } from '@/lib/journeys/store'
import { runIndex } from '@/lib/journeys/schema'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'no-store' }
let running = false
export async function GET(request: Request) {
  if (!localDebugAvailable())
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  const url = new URL(request.url)
  const personaId = url.searchParams.get('persona')
  if (!personas.some((p) => p.id === personaId))
    return Response.json(
      { error: 'Choose an existing persona' },
      { status: 400, headers }
    )
  try {
    const store = projectJourneyStore()
    const suite = await store.read(url.searchParams.get('run') ?? 'baseline')
    return Response.json(
      {
        run: runIndex(suite),
        journey: suite.journeys.find((j) => j.personaId === personaId) ?? null
      },
      { headers }
    )
  } catch {
    return Response.json(
      { error: 'Saved run could not be read. Check its project artifact.' },
      { status: 400, headers }
    )
  }
}
export async function POST(request: Request) {
  if (!localDebugAvailable())
    return Response.json({ error: 'Not found' }, { status: 404, headers })
  if (!localFeedbackRequestAllowed(request))
    return Response.json(
      { error: 'Rerun from the local User Journeys page.' },
      { status: 403, headers }
    )
  const input = z
    .strictObject({ personaId: z.string().optional() })
    .safeParse(await readBoundedJson(request, 2000).catch(() => null))
  if (
    !input.success ||
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
    const suite = await runJourneySuite({
      id: `${Date.now()}-${randomUUID()}`,
      personaId: input.data.personaId
    })
    await projectJourneyStore().save(suite)
    return Response.json(
      { run: runIndex(suite), runs: await projectJourneyStore().list() },
      { headers }
    )
  } catch {
    return Response.json(
      { error: 'Rerun could not be saved. Earlier runs remain intact.' },
      { status: 500, headers }
    )
  } finally {
    running = false
  }
}
