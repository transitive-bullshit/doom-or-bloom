import { readFileSync } from 'node:fs'
import { requestSchema } from '../../lib/assessment/schema'
import { loadBundle } from '../../lib/content/loader'
import { runAssessment } from '../../lib/server/engine'
import { createFixtureProvider } from '../../lib/server/provider'

const input = requestSchema.parse(JSON.parse(readFileSync(0, 'utf8')))
console.log(
  JSON.stringify(
    await runAssessment(input, createFixtureProvider(), loadBundle(), true)
  )
)
