import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { supportedContentVersions } from '../lib/assessment/schema'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import { loadBundle } from '../lib/content/loader'
import { referenceSchema } from '../lib/content/schema'

const from = process.argv[2]
const to = process.argv[3]
if (
  !from ||
  !to ||
  from === to ||
  !supportedContentVersions.some((version) => version === from) ||
  !supportedContentVersions.some((version) => version === to) ||
  !to.endsWith('-draft')
)
  throw new Error('Supply distinct supported source and target draft versions.')
const seed = loadBundle(from)
const context = loadAuthoringContext(seed)
const sourceDirectory = `content/releases/${from}`
const targetDirectory = `content/releases/${to}`
if (existsSync(targetDirectory))
  throw new Error(
    'The target release already exists; create a new version rather than overwrite it.'
  )
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
function readEntries(directory: string) {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const source = path.join(directory, file).replaceAll(path.sep, '/')
      const raw = readFileSync(source, 'utf8')
      const parsed = matter(raw)
      return {
        source,
        raw,
        body: parsed.content,
        reference: referenceSchema.parse(parsed.data)
      }
    })
}
const base = readEntries(`${sourceDirectory}/references`)
const drafts = readdirSync('content/drafts', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))
  .flatMap((entry) => readEntries(`content/drafts/${entry.name}/references`))
const available = new Map(
  [...drafts, ...base].map((entry) => [entry.reference.id, entry])
)
const selected = new Map(base.map((entry) => [entry.reference.id, entry]))
const required = context.intake.sources.filter(
  (source) => source.requiredForInitialCorpus
)
const queue = required.flatMap((source) => source.referenceIds)
while (queue.length) {
  const id = queue.shift()!
  const entry = available.get(id)
  if (!entry) throw new Error(`Unavailable required/dependency snapshot: ${id}`)
  if (selected.has(id)) continue
  selected.set(id, entry)
  queue.push(...entry.reference.entities, ...entry.reference.related)
}
// All inherited entries must also retain their dependency closure.
for (const { reference } of selected.values())
  for (const id of [...reference.entities, ...reference.related])
    if (!selected.has(id)) throw new Error(`Missing dependency: ${id}`)

const ordered = [...selected.values()].sort((a, b) =>
  a.reference.id.localeCompare(b.reference.id)
)
const unmapped = required
  .filter((source) => !source.referenceIds.length)
  .map((source) => source.id)
const manifest = {
  ...seed.manifest,
  contentVersion: to,
  status: 'draft' as const,
  reviewer: null,
  hashes: {},
  changelog: `Local draft assembly: ${ordered.length} references; ${required.length - unmapped.length}/${required.length} required URLs mapped. Original access scopes/review status retained. Assessment/rubric/prompt semantics unchanged; earlier assessments retain ${from}. Human review and required-source completion remain open.`
}
mkdirSync(targetDirectory)
mkdirSync(`${targetDirectory}/references`)
for (const entry of ordered) {
  const metadata = { ...entry.reference, content_version: to }
  const body = entry.body
    .replaceAll('outside the demo', 'in the local draft corpus')
    .replaceAll('outside the runtime bundle', 'in the local draft corpus')
  writeFileSync(
    `${targetDirectory}/references/${entry.reference.id}.md`,
    `---\n${JSON.stringify(metadata, null, 2)}\n---\n${body}`
  )
}
const writeJson = (file: string, data: unknown) =>
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
writeJson(
  `${targetDirectory}/prompts.json`,
  seed.prompts.map((prompt) => ({ ...prompt, contentVersion: to }))
)
writeJson(`${targetDirectory}/findings.json`, seed.findings)
writeJson(`${targetDirectory}/resources.json`, seed.resources)
writeJson(`${targetDirectory}/provenance.json`, {
  kind: 'local-draft-assembly',
  sourceContentVersion: from,
  contentVersion: to,
  intakeSha256: sha256(readFileSync('content/source-intake.json', 'utf8')),
  unmappedRequiredSourceIds: unmapped,
  changes: [
    'Release metadata',
    'Local draft inclusion wording; original drafts retained'
  ],
  references: ordered.map((entry) => ({
    id: entry.reference.id,
    source: entry.source,
    sourceContentVersion: entry.reference.content_version,
    sourceSha256: sha256(entry.raw)
  }))
})
writeJson(`${targetDirectory}/manifest.json`, manifest)
loadBundle(to)
// Preserve the original release descriptor before changing the current pointer.
const pinned = `${sourceDirectory}/manifest.json`
if (existsSync(pinned)) {
  if (
    readFileSync(pinned, 'utf8') !==
    JSON.stringify(seed.manifest, null, 2) + '\n'
  )
    throw new Error(
      'The original pinned manifest differs; resolve it before activation.'
    )
} else writeJson(pinned, seed.manifest)
writeJson('content/manifest.json', manifest)
console.log(
  `Assembled ${to}: ${ordered.length} draft-release references, ${unmapped.length} unmapped required URLs. No editorial approval or freeze occurred.`
)
