import 'server-only'
import { z } from 'zod'
import { notFound } from 'next/navigation'
import { AssessmentError } from './contracts'
import { repository } from './server'
export async function loadPublished(id: string) {
  if (!z.uuid().safeParse(id).success) notFound()
  return repository()
    .publicLoad(id)
    .catch((err: unknown) => {
      if (err instanceof AssessmentError && err.status === 404) notFound()
      throw err
    })
}
