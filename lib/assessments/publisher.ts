import { z } from 'zod'

export const publisherSchema = z.strictObject({
  name: z.string(),
  username: z
    .string()
    .regex(/^[A-Za-z0-9_]{1,15}$/)
    .nullable()
    .default(null),
  image: z.string().nullable(),
  profileUrl: z.url().nullable()
})
export type Publisher = z.infer<typeof publisherSchema>
