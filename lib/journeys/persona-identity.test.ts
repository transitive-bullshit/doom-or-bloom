import { expect, test } from 'vitest'
import { personas } from './catalog'
import { people } from '@/components/landing/people'

test('public persona navigation uses unique lowercase X usernames or named fallbacks', () => {
  expect(new Set(people.map((person) => person.slug)).size).toBe(people.length)
  for (const person of people) {
    const persona = personas.find((entry) => entry.id === person.id)!
    expect(persona.slug).toBe(person.slug)
    expect(persona.xUsername).toBe(person.xUsername)
    expect(person.slug).toBe(person.slug.toLowerCase())
  }
  for (const person of people.filter((entry) => entry.xUrl)) {
    expect(person.xUsername).toBe(
      new URL(person.xUrl!).pathname.slice(1).toLowerCase()
    )
    expect(person.slug).toBe(person.xUsername)
  }
  for (const person of people.filter((entry) => !entry.xUrl)) {
    expect(person.xUsername).toBeNull()
    expect(person.slug).not.toBe(person.id)
  }
  expect(people.find((person) => person.name === 'Donald Trump')?.slug).toBe(
    'realdonaldtrump'
  )
})

test('Independent 100 preserves original users and features the three selected additions', async () => {
  const { default: directory } =
    await import('../../docs/research/independent-100-accounts-2026-09-25.json')
  const aliases: Record<string, string> = { alltheyud: 'esyudkowsky' }
  const featuredAdditions = new Set(['simonw', 'thestalwart', 'badlogicgames'])
  for (const account of directory.accounts) {
    const handle = account.handle.toLowerCase()
    const matching = people.filter(
      (person) => person.xUsername === (aliases[handle] ?? handle)
    )
    expect(matching).toHaveLength(1)
    const person = matching[0]!
    const original = handle === 'alltheyud' || handle === 'slatestarcodex'
    expect(person.featured).toBe(original || featuredAdditions.has(handle))
    expect(person.id.startsWith('independent-')).toBe(!original)
    const brief = personas.find((entry) => entry.id === person.id)!
    expect(brief.sources.length).toBeGreaterThan(0)
  }
  expect(
    people.filter((person) => person.id.startsWith('independent-'))
  ).toHaveLength(97)
})

// Accepted homepage curation at this revision, including later feature changes.
// Update these identities only with an intentional curation change.
test('homepage selection preserves the accepted featured identities', () => {
  expect(
    people
      .filter((person) => person.featured)
      .map((person) => person.slug)
      .sort()
  ).toEqual([
    '_sholtodouglas',
    'amcafee',
    'andrewyng',
    'badlogicgames',
    'barackobama',
    'billgates',
    'dacemoglumit',
    'darioamodei',
    'davidsacks',
    'demishassabis',
    'dkokotajlo',
    'drfeifei',
    'dwarkesh_sp',
    'edzitron',
    'elonmusk',
    'emilymbender',
    'esyudkowsky',
    'finkd',
    'garymarcus',
    'geoffreyhinton',
    'ilyasut',
    'jensenhuang',
    'jkcarlsmith',
    'karpathy',
    'liang-wenfeng',
    'natolambert',
    'noahpinion',
    'noamshazeer',
    'pmarca',
    'polynoamial',
    'random_walker',
    'realdonaldtrump',
    'richardssutton',
    'ryangreenblatt',
    'sama',
    'sensanders',
    'simonw',
    'slatestarcodex',
    'so8res',
    'stuart-russell',
    'tegmark',
    'thestalwart',
    'timnitgebru',
    'tszzl',
    'tylercowen',
    'ylecun',
    'yoshua_bengio'
  ])
})

test('top tech posters map to one existing or added user, or a recorded exclusion', async () => {
  const { default: directory } =
    await import('../../docs/research/tech-posters-accounts-2026-10-05.json')
  const rows = directory.accounts.map((account) => {
    const matching = people.filter(
      (person) => person.xUsername === account.handle.toLowerCase()
    )
    const brief = personas.find((entry) => entry.id === matching[0]?.id)
    return {
      handle: account.handle,
      status: account.status,
      matches: matching.length,
      reason: account.status === 'excluded' && Boolean(account.reason),
      addedAs: account.status === 'added' ? matching[0]?.id : undefined,
      featured: account.status === 'added' ? matching[0]?.featured : undefined,
      sources: account.status === 'added' ? (brief?.sources.length ?? 0) : 0
    }
  })
  const excluded = rows.filter((row) => row.status === 'excluded')
  const kept = rows.filter((row) => row.status !== 'excluded')
  const added = directory.accounts.filter(
    (account) => account.status === 'added'
  )
  expect(excluded.filter((row) => row.matches || !row.reason)).toEqual([])
  expect(kept.filter((row) => row.matches !== 1)).toEqual([])
  expect(
    kept.filter((row) => !['existing', 'added'].includes(row.status))
  ).toEqual([])
  expect(
    rows.filter((row) => row.status === 'added').map((row) => row.addedAs)
  ).toEqual(added.map((account) => account.personaId))
  expect(
    rows.filter(
      (row) => row.status === 'added' && (row.featured || row.sources < 6)
    )
  ).toEqual([])
})
