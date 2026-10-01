import { describe, expect, test } from 'vitest'
import english from '@/messages/en.json'
import { testTranslator } from '@/i18n/test-translator'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from './state'
import { facets, facetUnsettledClaim } from './facets'
import {
  resultReason,
  supportedClaim,
  uncertainClaim,
  unestablishedClaim,
  unplacedClaim,
  unresolvedClaim
} from './projections'
import { tensionText } from './tension'
import { timelineExpressedClaim, timelineUnsettledClaim } from './timeline'
import {
  experimentalAxes,
  hinges,
  milestones,
  tentativeAxisClaim,
  unsettledAxisClaim
} from './worldview-experiment'
import {
  claimText,
  componentLabel,
  hingeLabel,
  hingeQuestion,
  milestoneLabel,
  promptText
} from './display-text'
import { createFixtureProvider } from '@/lib/server/provider'
import { runAssessment } from '@/lib/server/engine'

const en = testTranslator('en')
const es = testTranslator('es')
const rubric = loadBundle().rubric

// English messages must reproduce the canonical text saved in snapshots, so
// the English display is unchanged and drift fails here.
describe('English messages match the canonical saved text', () => {
  test('labels', () => {
    for (const facet of facets)
      expect(componentLabel(en, { vector: facet.id, label: '' })).toBe(
        facet.label
      )
    for (const [id, axis] of Object.entries(experimentalAxes))
      expect(componentLabel(en, { vector: id, label: '' })).toBe(axis.label)
    for (const dimension of [
      ...rubric.dimensions,
      { id: 'catastrophic_risk', ...rubric.catastrophicRisk }
    ]) {
      expect(componentLabel(en, { vector: dimension.id, label: '' })).toBe(
        dimension.label
      )
      expect(en(`Claims.topics.${dimension.id}` as never)).toBe(
        dimension.label.toLowerCase()
      )
    }
    for (const milestone of milestones) {
      expect(milestoneLabel(en, milestone)).toBe(milestone.label)
      expect(milestoneLabel(es, milestone)).not.toBe(milestone.label)
    }
    for (const hinge of hinges) {
      expect(hingeLabel(en, hinge)).toBe(hinge.label)
      expect(hingeQuestion(en, hinge)).toBe(hinge.question)
      expect(hingeQuestion(es, hinge)).not.toBe(hinge.question)
    }
    // A label that is not the canonical text for its ID is shown as saved.
    expect(milestoneLabel(es, { id: 'agi', label: 'Milestone 2' })).toBe(
      'Milestone 2'
    )
  })

  test('claims', () => {
    const claims = [
      uncertainClaim,
      unestablishedClaim,
      unresolvedClaim,
      facetUnsettledClaim,
      unsettledAxisClaim,
      tentativeAxisClaim,
      timelineUnsettledClaim,
      timelineExpressedClaim(3)
    ]
    for (const claim of claims) {
      expect(claimText(en, claim, 'timeline')).toBe(claim)
      expect(claimText(es, claim, 'timeline')).not.toBe(claim)
    }
    for (const vector of Object.keys(english.Claims.unplacedUncertain))
      for (const unknown of [true, false]) {
        const claim = unplacedClaim(vector, unknown)
        expect(claimText(en, claim, vector)).toBe(claim)
        expect(claimText(es, claim, vector)).toMatch(/^(Expresaste|Estas)/u)
      }
    for (const { id, levels } of [
      ...facets,
      ...Object.entries(experimentalAxes).map(([id, axis]) => ({
        id,
        levels: axis.levels
      }))
    ])
      for (const level of levels) {
        expect(claimText(en, level, id)).toBe(level)
        expect(claimText(es, level, id)).not.toBe(level)
      }
  })

  test('result reasons', () => {
    const placed = { value: 0.5 }
    for (const capped of [true, false])
      for (const horizontal of [placed, { value: null }])
        for (const pdoom of [undefined, { token: '≈5%' }]) {
          const result = {
            capped,
            horizontal,
            experiment: { transformation: placed, pdoom }
          } as Parameters<typeof resultReason>[0]
          const kind =
            horizontal.value === null
              ? capped
                ? 'unplacedCapped'
                : 'unplaced'
              : `${capped ? 'capped' : 'placed'}${pdoom ? '' : 'NoRisk'}`
          expect(resultReason(result)).toBe(
            en(`Results.reason.${kind}` as never)
          )
        }
  })
})

describe('Spanish display', () => {
  test('keeps authored rubric levels and translates the code around them', () => {
    const levels = rubric.dimensions[0]!.levels
    expect(claimText(es, levels[1]!, rubric.dimensions[0]!.id)).toBe(levels[1])
    const readings = supportedClaim(
      facets[1]!.levels,
      { 0: 0.45, 1: 0.45, 2: 0.1 },
      false,
      0.6
    )
    expect(claimText(en, readings, facets[1]!.id)).toBe(readings)
    expect(claimText(es, readings, facets[1]!.id)).toBe(
      `Varias lecturas siguen siendo plausibles: ${['0', '1', '2']
        .map((i) => es(`Claims.levels.outlook_orientation.${i}` as never))
        .join(' / ')}`
    )
    expect(componentLabel(es, { vector: 'risk_landscape', label: 'x' })).toBe(
      'Daño esperado'
    )
    expect(componentLabel(es, { vector: 'unknown', label: 'Kept' })).toBe(
      'Kept'
    )
    expect(
      hingeQuestion(es, hinges[0]!, { name: 'Ada', possessivePronoun: 'her' })
    ).toBe(
      'Si este supuesto resultara distinto, ¿cómo cambiaría su perspectiva?'
    )
  })

  test('rebuilds prompts built in code and keeps authored questions', () => {
    const quotes = [
      { answerId: 'a', text: 'AI will help' },
      { answerId: 'b', text: 'we cannot control it' }
    ]
    const tension = {
      text: tensionText(quotes),
      family: 'scope',
      variant: 'tension',
      quotedClaims: quotes
    }
    expect(promptText(en, tension)).toBe(tension.text)
    expect(promptText(es, tension)).toBe(
      'Sobre la IA, dijiste “AI will help” y “we cannot control it”. ¿Cómo encajan ambas ideas?'
    )
    const authored = { text: 'What do you think?', family: 'root', variant: '' }
    expect(promptText(es, authored)).toBe(authored.text)
  })

  test('rebuilds a correction prompt issued by the engine', async () => {
    const provider = createFixtureProvider()
    let state = createAssessment('display-correction')
    for (const operation of [
      { type: 'answer', text: 'A relevant synthetic view about control.' },
      { type: 'project' },
      { type: 'clarify', vector: 'technical_controllability' }
    ] as const)
      state = (
        await runAssessment(
          {
            assessment: state,
            operation,
            requestId: `display-${operation.type}`,
            debug: false
          },
          provider,
          loadBundle(),
          true
        )
      ).assessment
    const prompt = state.prompts.at(-1)!
    expect(prompt.family).toBe('clarification')
    expect(promptText(en, prompt)).toBe(prompt.text)
    expect(promptText(es, prompt)).toMatch(
      /^Nuestra lectura sobre la controlabilidad fue: “.+” ¿Qué cambiarías de esa interpretación\?$/u
    )
  })
})
