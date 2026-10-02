import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { people } from '@/components/landing/people'
import identities from './person-identities.json'

// Hand-checked English Wikipedia articles about each simulated user's real
// person, with the Wikidata item each article belongs to. People without an
// article about them (pseudonymous accounts, namesakes, redirects to an
// organization or a blog) are left out rather than guessed. See docs/SEO.md.
const identity = z.strictObject({
  wikipedia: z
    .url({ protocol: /^https$/u })
    .regex(/^https:\/\/en\.wikipedia\.org\/wiki\/[^\s/?#]+$/u),
  wikidata: z
    .url({ protocol: /^https$/u })
    .regex(/^https:\/\/www\.wikidata\.org\/wiki\/Q[1-9]\d*$/u)
})

describe('person identities', () => {
  const entries = Object.entries(identities)

  it('maps known profile slugs to well-formed Wikipedia and Wikidata pages', () => {
    const slugs = new Set(people.map((person) => person.slug))
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.filter(([slug]) => !slugs.has(slug))).toEqual([])
    for (const [, links] of entries) identity.parse(links)
  })

  it('never gives two people the same article or item', () => {
    for (const key of ['wikipedia', 'wikidata'] as const) {
      const links = entries.map(([, links]) => links[key])
      expect(new Set(links).size).toBe(links.length)
    }
  })
})
