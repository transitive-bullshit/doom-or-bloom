import { writeFile } from 'node:fs/promises'
import { bundleHashes, loadBundle, validateBundle } from '../lib/content/loader'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import { validateRequiredSourceReview } from '../lib/content/release'

const reviewer = process.argv[2]?.trim()
const changelog = process.argv[3]?.trim()
if (!reviewer || !changelog)
  throw new Error(
    'Supply the actual human reviewer and release changelog. Draft assets cannot be frozen.'
  )
const bundle = loadBundle()
validateRequiredSourceReview(bundle, loadAuthoringContext(bundle).intake)
const manifest = {
  ...bundle.manifest,
  status: 'reviewed' as const,
  reviewer,
  changelog,
  hashes: bundleHashes(bundle)
}
validateBundle({ ...bundle, manifest })
await writeFile(
  `content/releases/${manifest.contentVersion}/manifest.json`,
  JSON.stringify(manifest, null, 2) + '\n'
)
await writeFile(
  'content/manifest.json',
  JSON.stringify(manifest, null, 2) + '\n'
)
console.log(
  `Frozen ${Object.keys(manifest.hashes).length} reviewed assets. Run formatting first; modifying files afterward invalidates the hashes.`
)
