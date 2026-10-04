import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import snapshot from './site-social-points.json'
import {
  applySiteSocialReview,
  createSiteSocialReview
} from './site-social-review'
import {
  renderSiteSocialImage,
  snapshotSocialPoints
} from './render-site-social'

const targets = {
  points: 'lib/sharing/site-social-points.json',
  image: 'app/opengraph-image.png',
  alt: 'app/opengraph-image.alt.txt'
}
const after = structuredClone(snapshot)
after[0]!.transformation = 0.25
let suiteRoot: string
let template: string
let root: string
let directory: string
let before: Record<keyof typeof targets, Buffer>

// Render one immutable review; each test gets its own approved files and bundle.
beforeAll(async () => {
  suiteRoot = await mkdtemp(path.join(os.tmpdir(), 'site-social-review-'))
  template = path.join(suiteRoot, 'template')
  await mkdir(path.join(template, 'app'), { recursive: true })
  await mkdir(path.join(template, 'lib/sharing'), { recursive: true })
  before = {
    points: await readFile(targets.points),
    image: await readFile(targets.image),
    alt: await readFile(targets.alt)
  }
  for (const [key, file] of Object.entries(targets))
    await writeFile(
      path.join(template, file),
      before[key as keyof typeof targets]
    )
  await createSiteSocialReview(
    path.join(template, 'review'),
    after,
    'local',
    template
  )
})
beforeEach(async () => {
  root = await mkdtemp(path.join(suiteRoot, 'apply-'))
  await cp(template, root, { recursive: true })
  directory = path.join(root, 'review')
})
afterAll(async () => {
  if (suiteRoot) await rm(suiteRoot, { recursive: true, force: true })
})
async function expectApproved(overrides: Partial<typeof before> = {}) {
  for (const [key, file] of Object.entries(targets)) {
    const name = key as keyof typeof targets
    expect(await readFile(path.join(root, file))).toEqual(
      overrides[name] ?? before[name]
    )
  }
}
async function replaceReviewedFile(file: string, bytes: Buffer) {
  const manifest = path.join(directory, 'review.json')
  const review = JSON.parse(await readFile(manifest, 'utf8'))
  review.hashes[file] = createHash('sha256').update(bytes).digest('hex')
  await writeFile(path.join(directory, file), bytes)
  await writeFile(manifest, JSON.stringify(review))
}

test('capture records changes and hashed alt artifacts without changing approved files', async () => {
  const review = JSON.parse(
    await readFile(path.join(directory, 'review.json'), 'utf8')
  )
  expect(review.changes).toEqual([
    { slug: after[0]!.slug, before: snapshot[0], after: after[0] }
  ])
  expect(await readFile(path.join(directory, 'before-alt.txt'))).toEqual(
    before.alt
  )
  await expectApproved()
})

test.each(['points', 'image', 'alt'] as const)(
  'apply preserves a changed approved %s file',
  async (target) => {
    const correction = Buffer.from('An approved correction\n')
    await writeFile(path.join(root, targets[target]), correction)
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      'capture a new review'
    )
    await expectApproved({ [target]: correction })
  }
)

test.each(['after.png', 'after-alt.txt'])(
  'apply rejects a corrupt %s artifact',
  async (file) => {
    await writeFile(path.join(directory, file), 'corrupt')
    await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
      `Review file changed: ${file}`
    )
    await expectApproved()
  }
)

test('apply rejects obsolete alt text even with a matching hash', async () => {
  await replaceReviewedFile(
    'after-alt.txt',
    Buffer.from('An obsolete design description\n')
  )
  await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
    'alt text no longer matches'
  )
  await expectApproved()
})

test('apply rejects points that no longer reproduce the reviewed PNG', async () => {
  await replaceReviewedFile(
    'after-points.json',
    Buffer.from(JSON.stringify(snapshot))
  )
  await expect(applySiteSocialReview(directory, root)).rejects.toThrow(
    'no longer matches'
  )
  await expectApproved()
})

test('apply copies exact reviewed inputs and pixels that replay offline', async () => {
  await applySiteSocialReview(directory, root)
  expect(
    JSON.parse(await readFile(path.join(root, targets.points), 'utf8'))
  ).toEqual(after)
  for (const [target, file] of [
    ['image', 'after.png'],
    ['alt', 'after-alt.txt']
  ] as const)
    expect(await readFile(path.join(root, targets[target]))).toEqual(
      await readFile(path.join(directory, file))
    )
  expect(
    await renderSiteSocialImage(await snapshotSocialPoints(after))
  ).toEqual(await readFile(path.join(directory, 'after.png')))
})
