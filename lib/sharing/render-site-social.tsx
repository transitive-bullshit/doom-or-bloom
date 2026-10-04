import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { render } from 'takumi-js'
import { Renderer } from 'takumi-js/node'
import { z } from 'zod'
import { presentResult } from '@/lib/assessment/present-result'
import type { Result } from '@/lib/assessment/schema'
import { loadSocialPortrait } from './portraits'
import {
  SiteSocialCard,
  siteSocialFaces,
  type SiteSocialPoint
} from './site-social-card'

/**
 * Place featured simulated users exactly as the landing map does, from their
 * presented results. Featured faces must all be placed, or generation fails.
 */
export const siteSocialSnapshotSchema = z
  .array(
    z.strictObject({
      slug: z.string().min(1),
      avatar: z.string().regex(/^\/personas\/[\w.-]+$/),
      outlook: z.number().min(0).max(1),
      transformation: z.number().min(0).max(1)
    })
  )
  .refine(
    (points) => new Set(points.map((p) => p.slug)).size === points.length,
    {
      message: 'Duplicate social-image slugs'
    }
  )
export type SiteSocialSnapshot = z.infer<typeof siteSocialSnapshotSchema>

export function siteSocialSnapshot(
  people: readonly { slug: string; avatar: string; result: Result }[]
) {
  const placed = people.flatMap(({ slug, avatar, result }) => {
    const shown = presentResult(result)
    const outlook = shown.horizontal.value
    const transformation = shown.experiment?.transformation.value
    return outlook == null || transformation == null
      ? []
      : [{ slug, avatar, outlook, transformation }]
  })
  const missing = siteSocialFaces.filter(
    (slug) => !placed.some((person) => person.slug === slug)
  )
  if (missing.length)
    throw new Error(
      `Featured faces are not placed on the featured map: ${missing.join(', ')}`
    )
  return siteSocialSnapshotSchema.parse(placed)
}

export async function snapshotSocialPoints(
  snapshot: SiteSocialSnapshot
): Promise<SiteSocialPoint[]> {
  const points = siteSocialSnapshotSchema.parse(snapshot)
  const missing = siteSocialFaces.filter(
    (slug) => !points.some((point) => point.slug === slug)
  )
  if (missing.length)
    throw new Error(
      `Social-image snapshot is missing faces: ${missing.join(', ')}`
    )
  return Promise.all(
    points.map(async ({ slug, avatar, outlook, transformation }) => ({
      slug,
      outlook,
      transformation,
      portrait: siteSocialFaces.includes(slug)
        ? await loadSocialPortrait(avatar)
        : undefined
    }))
  )
}

export async function siteSocialPoints(
  people: readonly { slug: string; avatar: string; result: Result }[]
) {
  return snapshotSocialPoints(siteSocialSnapshot(people))
}

let renderer: Promise<Renderer> | undefined

// The typeface is checked in (SIL OFL) so every machine renders the same image.
function siteRenderer() {
  return (renderer ??= (async () => {
    const instance = new Renderer()
    await instance.registerFont({
      name: 'Inter Tight',
      data: await readFile(
        path.join(process.cwd(), 'lib/sharing/fonts/InterTight.woff2')
      )
    })
    return instance
  })())
}

export async function renderSiteSocialImage(
  points: readonly SiteSocialPoint[]
) {
  return render(SiteSocialCard({ points }), {
    width: 1200,
    height: 630,
    format: 'png',
    renderer: await siteRenderer(),
    signal: AbortSignal.timeout(10_000)
  })
}
