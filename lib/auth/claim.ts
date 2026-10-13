import { and, eq, gt, inArray, sql } from 'drizzle-orm'
import type { drizzle } from 'drizzle-orm/node-postgres'
import { assessments, session, user } from '../db/schema'
import { earliestFirstTouch, parseFirstTouch } from '../attribution/first-touch'

/** Called only after Better Auth has authenticated the destination account. */
export async function claimAnonymousAssessments(
  database: ReturnType<typeof drizzle>,
  anonymousId: string,
  authenticatedId: string,
  anonymousToken: string
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
    // Better Auth may resolve the anonymous session from its cookie cache.
    // Claim only from a session the database still holds, as without it.
    const [live] = await tx
      .select({ id: session.id })
      .from(session)
      .where(
        and(
          eq(session.token, anonymousToken),
          eq(session.userId, anonymousId),
          gt(session.expiresAt, sql`now()`)
        )
      )
    if (!live) return
    // Keep whichever origin is older: the anonymous browser usually found the
    // site first, but an existing account may predate it.
    const firstTouch = earliestFirstTouch(target.firstTouch, source.firstTouch)
    if (firstTouch && firstTouch.at !== parseFirstTouch(target.firstTouch)?.at)
      await tx
        .update(user)
        .set({ firstTouch })
        .where(eq(user.id, authenticatedId))
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
