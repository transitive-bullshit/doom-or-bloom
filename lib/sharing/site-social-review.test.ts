import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from 'vitest'
import snapshot from './site-social-points.json'
import {
  applySiteSocialReview,
  createSiteSocialReview
} from './site-social-review'
import {
  renderSiteSocialImage,
  snapshotSocialPoints
} from './render-site-social'

test('refresh captures a review, rejects stale or changed bundles, and applies replayable inputs and pixels', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'site-social-review-'))
  try {
    await mkdir(path.join(root, 'app'))
    await mkdir(path.join(root, 'lib/sharing'), { recursive: true })
    const pointsFile = path.join(root, 'lib/sharing/site-social-points.json')
    const imageFile = path.join(root, 'app/opengraph-image.png')
    const beforePoints = await readFile('lib/sharing/site-social-points.json')
    const beforeImage = await readFile('app/opengraph-image.png')
    await writeFile(pointsFile, beforePoints)
    await writeFile(imageFile, beforeImage)
    const after = structuredClone(snapshot)
    after[0]!.transformation = 0.25
    const directory = path.join(root, 'review')
    const review = await createSiteSocialReview(directory, after, 'local', root)
    expect(review.changes).toEqual([
      { slug: after[0]!.slug, before: snapshot[0], after: after[0] }
    ])
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    expect(await readFile(imageFile)).toEqual(beforeImage)
    const afterImage = await readFile(path.join(directory, 'after.png'))

    await writeFile(pointsFile, 'changed base')
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'capture a new review'
    )
    expect(await readFile(imageFile)).toEqual(beforeImage)
    await writeFile(pointsFile, beforePoints)
    await writeFile(path.join(directory, 'after.png'), 'corrupt')
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'Review file changed'
    )
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    await writeFile(path.join(directory, 'after.png'), afterImage)

    const reviewedManifest = await readFile(path.join(directory, 'review.json'))
    const reviewedPoints = await readFile(
      path.join(directory, 'after-points.json')
    )
    const mismatchedPoints = Buffer.from(JSON.stringify(snapshot))
    await writeFile(path.join(directory, 'after-points.json'), mismatchedPoints)
    await writeFile(
      path.join(directory, 'review.json'),
      JSON.stringify({
        ...review,
        hashes: {
          ...review.hashes,
          'after-points.json': createHash('sha256')
            .update(mismatchedPoints)
            .digest('hex')
        }
      })
    )
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'no longer matches'
    )
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    expect(await readFile(imageFile)).toEqual(beforeImage)
    await writeFile(path.join(directory, 'after-points.json'), reviewedPoints)
    await writeFile(path.join(directory, 'review.json'), reviewedManifest)

    await applySiteSocialReview(directory, root)
    expect(JSON.parse(await readFile(pointsFile, 'utf8'))).toEqual(after)
    expect(await readFile(imageFile)).toEqual(afterImage)
    expect(
      await renderSiteSocialImage(await snapshotSocialPoints(after))
    ).toEqual(afterImage)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
