import type { Messages } from 'next-intl'
import type { Translator } from '@/i18n/translator'
import type { PromptInstance } from './schema'
import { facets, facetUnsettledClaim } from './facets'
import {
  claimReadings,
  uncertainClaim,
  unestablishedClaim,
  unplacedClaim,
  unresolvedClaim
} from './projections'
import { tensionText } from './tension'
import { timelineClaimAnswer, timelineUnsettledClaim } from './timeline'
import {
  experimentalAxes,
  hinges,
  milestones,
  tentativeAxisClaim,
  unsettledAxisClaim
} from './worldview-experiment'
import { subjectArgs, type ResultSubject } from '@/lib/sharing/result-subject'

// Saved results keep canonical English: Jev reads it, and the engine validates
// stored prompts and claims by exact match. Text built in code is therefore
// mapped back to its ID here, at render time, and shown in the active locale.
// Authored content (rubric level texts, questions, findings, resources) has
// no translation yet and passes through unchanged.

type Claims = Messages['Claims']
type LabelId = keyof Claims['labels']
type LevelId = keyof Claims['levels']
type UnplacedId = keyof Claims['unplacedUncertain']

// Stored level texts of the facets and experimental axes, by vector.
const levelTexts = new Map<string, readonly string[]>([
  ...facets.map((facet) => [facet.id, facet.levels] as const),
  ['influence', experimentalAxes.influence.levels],
  ['transformation', experimentalAxes.transformation.levels]
])

const fixedClaims = {
  [uncertainClaim]: 'Claims.uncertain',
  [unestablishedClaim]: 'Claims.unestablished',
  [unresolvedClaim]: 'Claims.unresolved',
  [facetUnsettledClaim]: 'Claims.facetUnsettled',
  [unsettledAxisClaim]: 'Claims.axisUnsettled',
  [tentativeAxisClaim]: 'Claims.axisTentative',
  [timelineUnsettledClaim]: 'Claims.timelineUnsettled'
} as const

const has = (t: Translator, key: string) => t.has(key as never)

/** A component's display label, by vector; unknown vectors keep their own. */
export function componentLabel(
  t: Translator,
  component: { vector: string; label: string }
) {
  const key = `Claims.labels.${component.vector}` as const
  return has(t, key) ? t(key as `Claims.labels.${LabelId}`) : component.label
}

function levelText(t: Translator, vector: string, claim: string) {
  const index = levelTexts.get(vector)?.indexOf(claim) ?? -1
  if (index < 0) return null
  const key = `Claims.levels.${vector}.${index}`
  return has(t, key) ? t(key as `Claims.levels.${LevelId}.0`) : null
}

/** A stored claim in the active locale. */
export function claimText(t: Translator, claim: string, vector: string) {
  if (Object.hasOwn(fixedClaims, claim))
    return t(fixedClaims[claim as keyof typeof fixedClaims])
  if (has(t, `Claims.unplacedUncertain.${vector}`)) {
    const id = vector as UnplacedId
    if (claim === unplacedClaim(id, true))
      return t(`Claims.unplacedUncertain.${id}`)
    if (claim === unplacedClaim(id, false))
      return t(`Claims.unplacedUnestablished.${id}`)
  }
  const answer = timelineClaimAnswer(claim)
  if (answer !== null) return t('Claims.timelineExpressed', { number: answer })
  const level = levelText(t, vector, claim)
  if (level !== null) return level
  const readings = claimReadings(claim)
  if (readings)
    return t('Claims.readings', {
      readings: readings
        .map((reading) => levelText(t, vector, reading) ?? reading)
        .join(' / ')
    })
  return claim
}

/** Each stored level text of a vector with its text in the active locale. */
export function levelTextsFor(
  t: Translator,
  vector: string,
  levels: readonly string[]
) {
  return levels.map((level) => ({
    claim: level,
    text: levelText(t, vector, level) ?? level
  }))
}

// Saved experiment labels are the canonical English for their ID; a label
// that differs (an older or hand-written snapshot) is shown as saved.
const canonical = (
  items: readonly { id: string; label: string }[],
  item: { id: string; label: string }
) => items.some(({ id, label }) => id === item.id && label === item.label)

export function milestoneLabel(
  t: Translator,
  milestone: { id: string; label: string }
) {
  return canonical(milestones, milestone)
    ? t(`Claims.milestones.${milestone.id}` as 'Claims.milestones.agi')
    : milestone.label
}

export function hingeLabel(
  t: Translator,
  hinge: { id: string; label: string }
) {
  return canonical(hinges, hinge)
    ? t(`Claims.hinges.${hinge.id}` as 'Claims.hinges.update')
    : hinge.label
}

/**
 * A hinge's follow-up question. The saved question addresses the participant;
 * a simulated user's page asks it about them instead.
 */
export function hingeQuestion(
  t: Translator,
  hinge: { id: string; question: string },
  subject?: ResultSubject
) {
  const key = `Claims.hingeQuestions.${hinge.id}`
  const saved = hinges.find(({ id }) => id === hinge.id)?.question
  return has(t, key) && (subject || saved === hinge.question)
    ? t(key as 'Claims.hingeQuestions.update', subjectArgs(subject))
    : hinge.question
}

const clarification =
  /^Our read of (.+?) was: “([\s\S]*)” What would you change about that interpretation\?$/u

/**
 * An issued prompt's display text. Prompts built in code (tension and
 * correction prompts) are rebuilt from their parts in the active locale;
 * authored questions keep their stored English until translated.
 */
export function promptText(
  t: Translator,
  prompt: Pick<
    PromptInstance,
    'text' | 'family' | 'variant' | 'quotedClaims' | 'target' | 'claimTarget'
  >
) {
  const quotes = prompt.quotedClaims
  if (
    prompt.variant === 'tension' &&
    quotes?.length === 2 &&
    prompt.text === tensionText(quotes)
  )
    return t('Conversation.tension', {
      first: quotes[0]!.text,
      second: quotes[1]!.text
    })
  const target = prompt.claimTarget ?? prompt.target
  const parts = clarification.exec(prompt.text)
  if (
    prompt.family === 'clarification' &&
    parts &&
    target &&
    has(t, `Claims.topics.${target}`)
  )
    return t('Conversation.clarification', {
      topic: t(`Claims.topics.${target}` as 'Claims.topics.risk_landscape'),
      claim: claimText(t, parts[2]!, target)
    })
  return prompt.text
}
