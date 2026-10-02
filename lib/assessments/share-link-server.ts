import 'server-only'
import { cache } from 'react'
import { getPool } from '../db'
import { shareLinkIdSchema } from '../sharing/share-links'
import { shareLinkRepository } from './share-links'

/** Resolves null for malformed, unknown, revoked or deleted links. */
export const findShareLink = cache(async (id: string) =>
  shareLinkIdSchema.safeParse(id).success
    ? shareLinkRepository(getPool()).find(id)
    : null
)
