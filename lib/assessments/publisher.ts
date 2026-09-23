import { z } from 'zod'

export const publisherSchema = z.strictObject({
  name: z.string(),
  image: z.string().nullable(),
  profileUrl: z.url().nullable()
})
export type Publisher = z.infer<typeof publisherSchema>
