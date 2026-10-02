import { people } from '../../components/landing/people'
import { personaMetadataSchema } from './payload'

/** Each simulated user's profile metadata as `people.ts` defines it now. */
export const catalogMetadata = () =>
  people.map((person, order) =>
    personaMetadataSchema.parse({ ...person, order })
  )
