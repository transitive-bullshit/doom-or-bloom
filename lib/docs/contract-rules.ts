// Contracts describe current behavior; dated records of what changed and how
// it was verified belong in docs/research/ (docs/README.md#maintaining-these-docs).
// Dated sections appended to a contract bury its procedures, and agents copy
// their stale commands and counts.

// The hosted verification log is dated by design.
const datedRecords = new Set(['production-readiness.md'])

const month =
  'January|February|March|April|May|June|July|August|September|October|November|December'
const date = new RegExp(
  `\\b(?:${month})\\s+\\d{1,2}(?:\\s*[–-]\\s*\\d{1,2})?,\\s+\\d{4}\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b`,
  'u'
)

/** The docs routed from the "Choose the relevant contract" table, relative to docs/. */
export function contractDocs(readme: string) {
  const table = readme.split(/^## Choose the relevant contract$/mu)[1]
  if (!table) throw new Error('docs/README.md has no contract table')
  const links = table
    .split(/^## /mu)[0]!
    .matchAll(/\]\(([\w./-]+\.md)(?:#[^)]*)?\)/gu)
  return [...new Set([...links].map((link) => link[1]!))].filter(
    (file) => !datedRecords.has(file)
  )
}

export function datedHeadings(body: string) {
  return body
    .split('\n')
    .filter((line) => /^#{1,6}\s/u.test(line) && date.test(line))
}
