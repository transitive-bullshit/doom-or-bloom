import { readFileSync } from 'node:fs'
import { runAssessment } from '../../lib/server/engine'
import { requestSchema } from '../../lib/assessment/schema'
import { loadBundle } from '../../lib/content/loader'
import { createFixtureProvider } from '../../lib/server/provider'
import type { Provider } from '../../lib/server/provider'

const fixture = createFixtureProvider()
const provider: Provider = {
  kind: 'fixture',
  async evaluate(...args) {
    const result = await fixture.evaluate(...args)
    for (const id of Object.keys(args[1]))
      if (id.endsWith(':novelty'))
        result.answers[id] = { type: 'noul', noul: 0 }
    return result
  }
}
const input = requestSchema.parse(JSON.parse(readFileSync(0, 'utf8')))
console.log(
  JSON.stringify(
    await runAssessment(
      input,
      provider,
      loadBundle(input.assessment.versions.content)
    )
  )
)
