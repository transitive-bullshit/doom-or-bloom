import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { z } from 'zod'
import {
  renderSiteSocialImage,
  siteSocialSnapshotSchema,
  snapshotSocialPoints,
  type SiteSocialSnapshot
} from './render-site-social'
import { siteSocialAlt } from './site-social-card'

const targets = {
  points: 'lib/sharing/site-social-points.json',
  image: 'app/opengraph-image.png',
  alt: 'app/opengraph-image.alt.txt'
} as const
const files = [
  'before.png',
  'after.png',
  'before-points.json',
  'after-points.json',
  'before-alt.txt',
  'after-alt.txt'
] as const
const hash = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex')
const reviewSchema = z.strictObject({
  source: z.enum(['local', 'production']),
  capturedAt: z.string(),
  hashes: z.record(z.string(), z.string()),
  changes: z.array(
    z.strictObject({
      slug: z.string(),
      before: siteSocialSnapshotSchema.element.optional(),
      after: siteSocialSnapshotSchema.element.optional()
    })
  )
})

/** Capture fresh data for review without touching the approved files. */
export async function createSiteSocialReview(
  directory: string,
  snapshot: SiteSocialSnapshot,
  source: 'local' | 'production',
  root = process.cwd()
) {
  const after = siteSocialSnapshotSchema.parse(snapshot)
  const beforeBytes = await readFile(path.join(root, targets.points))
  const before = siteSocialSnapshotSchema.parse(
    JSON.parse(beforeBytes.toString())
  )
  const previous = new Map(before.map((point) => [point.slug, point]))
  const next = new Map(after.map((point) => [point.slug, point]))
  const changes = [...new Set([...previous.keys(), ...next.keys()])].flatMap(
    (slug) => {
      const old = previous.get(slug),
        current = next.get(slug)
      return JSON.stringify(old) === JSON.stringify(current)
        ? []
        : [{ slug, before: old, after: current }]
    }
  )
  const contents = {
    'before.png': await readFile(path.join(root, targets.image)),
    'after.png': await renderSiteSocialImage(await snapshotSocialPoints(after)),
    'before-points.json': beforeBytes,
    'after-points.json': Buffer.from(`${JSON.stringify(after, null, 2)}\n`),
    'before-alt.txt': await readFile(path.join(root, targets.alt)),
    'after-alt.txt': Buffer.from(`${siteSocialAlt}\n`)
  }
  await mkdir(path.dirname(directory), { recursive: true })
  // A review is never overwritten; a new capture gets a new directory.
  await mkdir(directory)
  for (const file of files)
    await writeFile(path.join(directory, file), contents[file])
  const review = {
    source,
    capturedAt: new Date().toISOString(),
    hashes: Object.fromEntries(
      files.map((file) => [file, hash(contents[file])])
    ),
    changes
  }
  await writeFile(
    path.join(directory, 'review.json'),
    `${JSON.stringify(review, null, 2)}\n`
  )
  return review
}

/** Apply exact reviewed inputs and pixels, refusing a changed base or bundle. */
export async function applySiteSocialReview(
  directory: string,
  root = process.cwd()
) {
  const review = reviewSchema.parse(
    JSON.parse(await readFile(path.join(directory, 'review.json'), 'utf8'))
  )
  const contents = new Map<string, Buffer>()
  for (const file of files) {
    const bytes = await readFile(path.join(directory, file))
    if (hash(bytes) !== review.hashes[file])
      throw new Error(`Review file changed: ${file}`)
    contents.set(file, bytes)
  }
  const alt = contents.get('after-alt.txt')!
  if (!alt.equals(Buffer.from(`${siteSocialAlt}\n`)))
    throw new Error(
      'Review alt text no longer matches the current design; capture a new review'
    )
  const snapshot = siteSocialSnapshotSchema.parse(
    JSON.parse(contents.get('after-points.json')!.toString())
  )
  const points = await snapshotSocialPoints(snapshot)
  const image = contents.get('after.png')!
  const metadata = await sharp(image).metadata()
  if (
    metadata.format !== 'png' ||
    metadata.width !== 1200 ||
    metadata.height !== 630
  )
    throw new Error('Review image must be a 1200 × 630 PNG')
  if (!Buffer.from(await renderSiteSocialImage(points)).equals(image))
    throw new Error(
      'Review image no longer matches its points and current design; capture a new review'
    )
  for (const [target, before] of [
    [targets.points, 'before-points.json'],
    [targets.image, 'before.png'],
    [targets.alt, 'before-alt.txt']
  ] as const) {
    if (hash(await readFile(path.join(root, target))) !== review.hashes[before])
      throw new Error(
        'Approved social image, snapshot or alt text changed; capture a new review'
      )
  }
  await writeFile(
    path.join(root, targets.points),
    contents.get('after-points.json')!
  )
  await writeFile(path.join(root, targets.image), image)
  await writeFile(path.join(root, targets.alt), alt)
}
