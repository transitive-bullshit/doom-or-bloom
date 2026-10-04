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
    const altFile = path.join(root, 'app/opengraph-image.alt.txt')
    const beforePoints = await readFile('lib/sharing/site-social-points.json')
    const beforeImage = await readFile('app/opengraph-image.png')
    const beforeAlt = await readFile('app/opengraph-image.alt.txt')
    await writeFile(pointsFile, beforePoints)
    await writeFile(imageFile, beforeImage)
    await writeFile(altFile, beforeAlt)
    const after = structuredClone(snapshot)
    after[0]!.transformation = 0.25
    const directory = path.join(root, 'review')
    const review = await createSiteSocialReview(directory, after, 'local', root)
    expect(review.changes).toEqual([
      { slug: after[0]!.slug, before: snapshot[0], after: after[0] }
    ])
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    expect(await readFile(imageFile)).toEqual(beforeImage)
    expect(await readFile(altFile)).toEqual(beforeAlt)
    expect(await readFile(path.join(directory, 'before-alt.txt'))).toEqual(
      beforeAlt
    )
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

    const correctedAlt = Buffer.from('An accessibility copy fix\n')
    await writeFile(altFile, correctedAlt)
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'alt text changed'
    )
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    expect(await readFile(imageFile)).toEqual(beforeImage)
    expect(await readFile(altFile)).toEqual(correctedAlt)
    await writeFile(altFile, beforeAlt)

    const reviewedManifest = await readFile(path.join(directory, 'review.json'))
    const reviewedPoints = await readFile(
      path.join(directory, 'after-points.json')
    )
    const reviewedAlt = await readFile(path.join(directory, 'after-alt.txt'))
    const staleAlt = Buffer.from('An obsolete design description\n')
    await writeFile(path.join(directory, 'after-alt.txt'), staleAlt)
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'Review file changed: after-alt.txt'
    )
    await writeFile(
      path.join(directory, 'review.json'),
      JSON.stringify({
        ...review,
        hashes: {
          ...review.hashes,
          'after-alt.txt': createHash('sha256').update(staleAlt).digest('hex')
        }
      })
    )
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'alt text no longer matches'
    )
    expect(await readFile(pointsFile)).toEqual(beforePoints)
    expect(await readFile(imageFile)).toEqual(beforeImage)
    expect(await readFile(altFile)).toEqual(beforeAlt)
    await writeFile(path.join(directory, 'after-alt.txt'), reviewedAlt)
    await writeFile(path.join(directory, 'review.json'), reviewedManifest)
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
    expect(await readFile(altFile)).toEqual(reviewedAlt)
    expect(
      await renderSiteSocialImage(await snapshotSocialPoints(after))
    ).toEqual(afterImage)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
