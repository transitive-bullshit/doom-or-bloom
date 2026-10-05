import { techPostersAPersonas } from './tech-posters-a-personas'
import { techPostersBPersonas } from './tech-posters-b-personas'
import { techPostersCPersonas } from './tech-posters-c-personas'
import { techPostersDPersonas } from './tech-posters-d-personas'
import { techPostersEPersonas } from './tech-posters-e-personas'
import { techPostersFPersonas } from './tech-posters-f-personas'
import { techPostersGPersonas } from './tech-posters-g-personas'
import { techPostersHPersonas } from './tech-posters-h-personas'
import { techPostersIPersonas } from './tech-posters-i-personas'

// Accounts from the top-100 tech posters vote, researched 2026-10-05
// (docs/research/tech-posters-2026-10-05.md). Accounts already in the catalog
// keep their earlier briefs; each batch is also a generation group.
export const techPosterBatches = {
  a: techPostersAPersonas,
  b: techPostersBPersonas,
  c: techPostersCPersonas,
  d: techPostersDPersonas,
  e: techPostersEPersonas,
  f: techPostersFPersonas,
  g: techPostersGPersonas,
  h: techPostersHPersonas,
  i: techPostersIPersonas
}

// Researched but left out of the catalog; see the research record.
const dropped = new Set(['newageretronerd'])

export const techPosterPersonas = Object.values(techPosterBatches)
  .flat()
  .filter((person) => !dropped.has(person.slug!))
  .map((person) => ({ ...person, featured: false }))

// Named people whose own profiles or sources establish a pronoun; everyone
// else, including every pseudonymous account, reads as “their”.
export const techPosterPronouns: Record<string, 'his' | 'her'> = {
  sierracatalina: 'her',
  thsottiaux: 'his',
  alexandr_wang: 'his',
  bryan_johnson: 'his',
  growing_daniel: 'his',
  poteto: 'her',
  dylan522p: 'his',
  scobleizer: 'his',
  parmita: 'her',
  piercelilholt: 'his',
  tunguz: 'his',
  emostaque: 'his',
  luacantu: 'her',
  lindayax: 'her',
  theo: 'his',
  jasonkneen: 'his'
}
