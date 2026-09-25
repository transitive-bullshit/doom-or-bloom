import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { people } from '../components/landing/people'

// Read-only, batched lookup. Credentials remain in xurl's authenticated store.
const handles = [
  ...new Set(
    people.flatMap((person) =>
      person.xUrl ? [new URL(person.xUrl).pathname.slice(1).toLowerCase()] : []
    )
  )
]
const responseSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
        username: z.string(),
        public_metrics: z.object({
          followers_count: z.number().int().nonnegative()
        })
      })
    )
    .optional(),
  errors: z.array(z.unknown()).optional()
})
const accounts: Record<string, { id: string; followers: number }> = {}
for (let offset = 0; offset < handles.length; offset += 100) {
  const query = new URLSearchParams({
    usernames: handles.slice(offset, offset + 100).join(','),
    'user.fields': 'public_metrics'
  })
  const response = responseSchema.parse(
    JSON.parse(
      execFileSync(
        'xurl',
        ['--app', 'my-app', '--auth', 'oauth2', `/2/users/by?${query}`],
        { encoding: 'utf8' }
      )
    )
  )
  for (const user of response.data ?? [])
    accounts[user.username.toLowerCase()] = {
      id: user.id,
      followers: user.public_metrics.followers_count
    }
}
if (!Object.keys(accounts).length)
  throw new Error('No follower counts returned; previous snapshot preserved')
const missing = handles.filter((handle) => !accounts[handle])
await writeFile(
  new URL('../lib/personas/x-followers.json', import.meta.url),
  `${JSON.stringify({ capturedAt: new Date().toISOString(), accounts, missing }, null, 2)}\n`
)
console.log(
  `Captured ${Object.keys(accounts).length} accounts; unavailable: ${missing.join(', ') || 'none'}`
)
