import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import { notFound } from 'next/navigation'
import { AssessmentError } from './contracts'
import { repository } from './server'

/** Resolves null for malformed, unknown, private or deleted assessments. */
export const findPublished = cache(async (id: string) => {
  if (!z.uuid().safeParse(id).success) return null
  return repository()
    .publicLoad(id)
    .catch((err: unknown) => {
      if (err instanceof AssessmentError && err.status === 404) return null
      throw err
    })
})
export const loadPublished = cache(
  async (id: string) => (await findPublished(id)) ?? notFound()
)
