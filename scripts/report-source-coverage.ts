import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import { loadBundle } from '../lib/content/loader'
import { referenceSchema } from '../lib/content/schema'

const bundle = loadBundle()
const { intake } = loadAuthoringContext(bundle)
const inventoryDate = z.iso.date().parse(intake.asOf)
const inventoryYear = Number(inventoryDate.slice(0, 4))
function entries(directory: string, active: boolean) {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => ({
      reference: referenceSchema.parse(
        matter(readFileSync(path.join(directory, file), 'utf8')).data
      ),
      file: path.join(directory, file).replaceAll(path.sep, '/'),
      active
    }))
}
const active = entries(
  `content/releases/${bundle.manifest.contentVersion}/references`,
  true
)
const separate = readdirSync('content/drafts', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))
  .flatMap((entry) => entries(`content/drafts/${entry.name}/references`, false))
for (const population of [active, separate])
  if (
    new Set(population.map(({ reference }) => reference.id)).size !==
    population.length
  )
    throw new Error('Duplicate snapshot IDs within a coverage population')
// A current-release copy and its original authoring draft share one identity.
const byId = new Map(
  [...separate, ...active].map((snapshot) => [snapshot.reference.id, snapshot])
)
const snapshots = [...byId.values()]
const sharedCopies = separate.filter(({ reference }) =>
  active.some((entry) => entry.reference.id === reference.id)
).length
for (const source of intake.sources)
  for (const id of source.referenceIds)
    if (!byId.has(id)) throw new Error(`Unknown mapped snapshot: ${id}`)

const required = intake.sources.filter(
  (source) => source.requiredForInitialCorpus
)
const optional = intake.sources.filter(
  (source) => !source.requiredForInitialCorpus
)
const requiredIds = new Set(required.flatMap((source) => source.referenceIds))
const requiredSnapshots = snapshots.filter((snapshot) =>
  requiredIds.has(snapshot.reference.id)
)
const publications = requiredSnapshots.filter(
  ({ reference }) => reference.kind === 'publication'
)
const publicationYear = (date: string) => {
  const match = /^(\d{4})(?:-\d{2}(?:-\d{2})?)?$/.exec(date)
  return match ? Number(match[1]) : null
}
const mapped = (sources: typeof required) =>
  sources.filter((source) => source.referenceIds.length > 0).length
const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\n', ' ')
const linkLabel = (text: string) =>
  cell(text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
const snapshotLink = (id: string) => {
  const snapshot = byId.get(id)!
  return `[${linkLabel(snapshot.reference.title)}](../../${snapshot.file})${snapshot.active ? ' (demo)' : ''}`
}
const researchLinks = (source: (typeof required)[number]) =>
  source.researchRecords
    .map((record) => `[${linkLabel(record.heading)}](../../${record.path})`)
    .join('<br>') || 'None'
const sourceRow = (source: (typeof required)[number]) =>
  `| [${source.id}](${source.url}) | ${source.status} | ${source.referenceIds.map(snapshotLink).join('<br>') || 'No snapshot'} | ${researchLinks(source)} |`
const backgroundCount = separate.filter((snapshot) =>
  snapshot.file.includes('/publications-batch-')
).length
const overlapRows = snapshots.flatMap(({ reference }) => {
  const sources = intake.sources.filter((source) =>
    source.referenceIds.includes(reference.id)
  )
  return sources.length > 1
    ? [
        `| ${snapshotLink(reference.id)} | ${sources.map((source) => `[${source.id}](${source.url})${source.requiredForInitialCorpus ? ' (required)' : ''}`).join('<br>')} |`
      ]
    : []
})
const lines = [
  '# Source coverage and review index',
  '',
  'Generated from the intake registry and current demo/separate snapshot files. Regenerate with `pnpm --silent content:coverage > docs/research/source-coverage-2026-09-17.md`. Edit the authoritative intake/assets when review changes; this index does not confer review or activation.',
  '',
  'Required URL mappings, obtained reading scope, human review and compatible-release inclusion are separate gates. An asset marked draft remains unreviewed even when its source is accessible. See [SOURCES.md](../SOURCES.md) for freshness and genre rules.',
  '',
  '## Counts and populations',
  '',
  `Intake as of ${inventoryDate}; current demo content release ${bundle.manifest.contentVersion}.`,
  '',
  `The registry contains ${required.length} required and ${optional.length} optional candidate URLs. Mappings exist for ${mapped(required)} required URLs and ${mapped(optional)} of the optional candidates. ${requiredSnapshots.length} distinct snapshots are referenced by required URLs; mappings are not a one-URL/one-snapshot quota.`,
  '',
  `There are ${snapshots.length} distinct snapshot identities across current and authoring populations. ${sharedCopies} original authoring drafts have copies in the current release; do not add the two population totals as distinct content. Current copies are linked below when available.`,
  '',
  'Reviewed counts reflect stored asset metadata, including earlier representative approvals. They do not establish current required-URL review or a frozen release; the current manifest remains draft.',
  '',
  '| Population | Total | Entity | Event | Publication | Asset metadata reviewed |',
  '| --- | --- | --- | --- | --- | --- |',
  ...(
    [
      ['Current demo', active],
      ['Separate drafts', separate],
      ['Distinct required-mapped snapshots', requiredSnapshots]
    ] satisfies Array<[string, typeof snapshots]>
  ).map(([label, items]) => {
    return `| ${label} | ${items.length} | ${['entity', 'event', 'publication'].map((kind) => items.filter(({ reference }) => reference.kind === kind).length).join(' | ')} | ${items.filter(({ reference }) => reference.status === 'reviewed').length} |`
  }),
  '',
  '| Intake population | Pending | Research draft | Partial | Blocked | Draft | Reviewed |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...(
    [
      ['Required', required],
      ['Optional candidates', optional]
    ] satisfies Array<[string, typeof required]>
  ).map(([label, items]) => {
    return `| ${label} | ${['pending', 'research_draft', 'partial', 'blocked', 'draft', 'reviewed'].map((status) => items.filter((source) => source.status === status).length).join(' | ')} |`
  }),
  '',
  '## Publication date inventory',
  '',
  'These counts use publication metadata on distinct required-mapped publication snapshots. A recent publication can report older experiments or evidence. Unknown or qualified dates remain unclassified; inspection dates and dates embedded in IDs are not publication dates. Check each snapshot and research record before treating it as current grounding.',
  '',
  '| Publication metadata | Snapshots |',
  '| --- | --- |',
  `| ${inventoryYear} | ${publications.filter(({ reference }) => publicationYear(reference.date) === inventoryYear).length} |`,
  `| Earlier than ${inventoryYear} | ${
    publications.filter(({ reference }) => {
      const year = publicationYear(reference.date)
      return year !== null && year < inventoryYear
    }).length
  } |`,
  `| Later than intake year: requires review | ${
    publications.filter(({ reference }) => {
      const year = publicationYear(reference.date)
      return year !== null && year > inventoryYear
    }).length
  } |`,
  `| Unknown or qualified date | ${publications.filter(({ reference }) => publicationYear(reference.date) === null).length} |`,
  '',
  '## Access and mapping gates',
  '',
  'These records need access/scope reconciliation or a missing snapshot before full required-source incorporation can be accepted. A mapped partial source can describe only obtained material; a related accessible version does not silently replace its required original. Open each research record for its exact scope and next action.',
  '',
  '| Required original | Registry stage | Scoped snapshot | Research record |',
  '| --- | --- | --- | --- |',
  ...required
    .filter(
      (source) =>
        ['partial', 'blocked'].includes(source.status) ||
        !source.referenceIds.length
    )
    .map(sourceRow),
  '',
  '## All required mappings',
  '',
  'Every required original URL remains linked below. Research links identify the exact heading consulted; consult its reading limitations before extending any claim. Current demo markers describe runtime inclusion, not editorial approval.',
  '',
  '| Required original | Registry stage | Scoped snapshot | Research record |',
  '| --- | --- | --- | --- |',
  ...required.map(sourceRow),
  '',
  '## Overlapping source mappings',
  '',
  'Shared identities are retained rather than duplicated to fill counts. A hub may also map to several separately pinned publications; that relationship does not establish that the full archive was read.',
  '',
  '| Snapshot | Intake originals sharing it |',
  '| --- | --- |',
  ...(overlapRows.length ? overlapRows : ['| None recorded | — |']),
  '',
  '## Optional selection and exclusions',
  '',
  `The ${optional.length} candidates remain preserved in the intake registry. Unmapped candidates are pending selection, not silently excluded or required to become snapshots. The ${backgroundCount} earlier publication drafts remain background candidates. This index records no final optional exclusion decision; select by diagnostic usefulness, source quality and coverage during human review. Required URLs remain required regardless of optional overlap.`,
  '',
  '| Optional candidate already mapped | Registry stage | Snapshot | Research record |',
  '| --- | --- | --- | --- |',
  ...optional.filter((source) => source.referenceIds.length).map(sourceRow),
  '',
  '## Subject coverage inventory',
  '',
  'Counts below describe overlapping freeform subject tags on distinct required-mapped snapshots. They are navigation aids, not proof of balanced genres, conclusions, causal quality or user-journey coverage. Do not sum them as mutually exclusive categories or infer ideology from them.',
  '',
  '| Subject tag | Required-mapped snapshots |',
  '| --- | --- |',
  ...[
    ...new Set(requiredSnapshots.flatMap(({ reference }) => reference.topics))
  ]
    .sort()
    .map(
      (topic) =>
        `| ${cell(topic)} | ${requiredSnapshots.filter(({ reference }) => reference.topics.includes(topic)).length} |`
    ),
  '',
  '## Review completion criteria',
  '',
  'For each required original, record obtained scope and resolve access/version limitations, verify aliases and dates, review each supported claim and attribution limit, and record an actual human reviewer. Select one compatible release without changing existing identities or confusing publication version with content version. Review topical/genre gaps against the argument journeys and risk/concept boundaries, explain optional selections/exclusions, and freeze only after every required gate is satisfied. Numeric mapping or tag totals alone cannot complete the MVP.',
  ''
]
process.stdout.write(lines.join('\n'))
