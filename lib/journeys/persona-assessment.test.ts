import { expect, test } from 'vitest'
import { personaAssessment } from './persona-assessment'
import { journeySchema } from './schema'
import { readFileSync } from 'node:fs'
import type { JourneySuite } from './schema'

const suite: JourneySuite = JSON.parse(
  readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)

test('public inspection preserves Q&A and only uses input from the final result revision', () => {
  const journey = journeySchema.parse(
    suite.journeys.find((j) => j.personaId === 'anti-doomer')
  )
  const assessment = personaAssessment(journey)
  expect(assessment.answers.map((a) => a.answer)).toEqual(
    journey.steps.filter((s) => s.answer !== null).map((s) => s.answer)
  )
  expect(assessment.finalState?.completeParticipantEvidence).toBeDefined()
  journey.result!.evidenceRevision = 99999
  expect(personaAssessment(journey).finalState).toBeNull()
})
