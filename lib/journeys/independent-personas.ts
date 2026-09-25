import { independentFirstPersonas } from './independent-first-personas'
import { independentMiddlePersonas } from './independent-middle-personas'
import { independentLastPersonas } from './independent-last-personas'

// The directory's @allTheYud and @slatestarcodex retain their original fixtures.
export const independentPersonas = [
  ...independentFirstPersonas,
  ...independentMiddlePersonas,
  ...independentLastPersonas
].map((person) => ({ ...person, featured: person.featured ?? false }))
