import { and, eq, inArray, sql } from 'drizzle-orm'
import type { drizzle } from 'drizzle-orm/node-postgres'
import { assessments, session, user } from '../db/schema'

/** Called only after Better Auth has authenticated the destination account. */
export async function claimAnonymousAssessments(
  database: ReturnType<typeof drizzle>,
  anonymousId: string,
  authenticatedId: string
) {
  if (anonymousId === authenticatedId) return
  await database.transaction(async (tx) => {
    // Match creation/fork's owner lock; deterministic ordering prevents two claims
    // from acquiring user rows in opposite orders.
    const owners = await tx
      .select()
      .from(user)
      .where(inArray(user.id, [anonymousId, authenticatedId]))
      .orderBy(user.id)
      .for('update')
    const source = owners.find((row) => row.id === anonymousId)
    const target = owners.find((row) => row.id === authenticatedId)
    if (!target || target.isAnonymous)
      throw new Error('Claim requires an authenticated account')
    if (!source) return // The same successful claim may be observed again.
    if (!source.isAnonymous)
      throw new Error('Only anonymous ownership can be claimed')
    await tx
      .update(assessments)
      .set({
        ownerId: authenticatedId,
        // Creation keys belong to the originating browser identity. Keep them from
        // colliding with a destination account's independent creation requests.
        createRequestKey: sql`'claimed:' || ${anonymousId} || ':' || ${assessments.id}`
      })
      .where(
        and(
          eq(assessments.ownerId, anonymousId),
          eq(assessments.origin, 'participant')
        )
      )
    await tx.delete(session).where(eq(session.userId, anonymousId))
    // Restrict FKs make any overlooked owned records roll back the entire claim.
    await tx.delete(user).where(eq(user.id, anonymousId))
  })
}
