import type { Question } from '@/lib/assessment/schema'

export type DimensionDefinition = { id: string; label: string; meaning: string }
export type JsonHelpContext = {
  questions?: Record<string, Question | undefined>
  dimensions?: DimensionDefinition[]
}
type Explanations = Readonly<Record<string, string>>
const glossary = {
  coverage:
    'Which dimensions have supported evidence, unresolved meaning, or no evidence yet. Coverage measures what we can interpret, not how good the participant’s reasoning is.',
  confidence:
    'Jev’s confidence in this interpretation of the supplied text. It is separate from the participant’s conviction and is not a calibrated probability that a forecast is correct.',
  noul: 'Jev’s probability that the proposition in the recorded question is true. Noul is a yes/no judgment, rather than a score or a missing/null answer.',
  probabilities:
    'The distribution over the authored alternatives or levels for this judgment. Broader distributions indicate several plausible interpretations.',
  score:
    'An expectation over the ordered authored levels shown in the legend. A higher level means further along that particular scale, not automatically better reasoning.',
  legend:
    'The authored meaning of each numeric level on this score’s scale. The scale belongs to this judgment; numeric levels are not interchangeable between dimensions.',
  range:
    'The displayed interpretation bounds, expanded for missing evidence or material ambiguity. This is not a statistically calibrated confidence interval or event probability.',
  distribution:
    'Support for alternative authored interpretations. It reflects possible readings of the participant’s account, not frequencies of future outcomes.',
  value:
    'The normalized interpretation coordinate on this component’s authored scale. Missing components remain null and do not become a zero score.',
  claim:
    'An authored description of the most supported level for this component. It summarizes the supplied account and is open to correction.',
  provisional:
    'The result still has unexplored components or unresolved interpretation. Reaching the readiness threshold permits a first result without asserting completeness.',
  support:
    'Links between whole accepted answers and the dimensions they support. These are interpretations of the original answers, not additional independent evidence.',
  activeSupport:
    'Whole-answer support still in effect after corrections or disputes. Raw participant text is supplied separately once, and these records link it by ID.',
  judgments:
    'Stored typed interpretations with their original evaluator questions. Hover a judgment or its questionId to see what the recorded task was asking.',
  unresolved:
    'Ambiguities or apparent tensions that may merit a follow-up. Different scopes, revisions and changed assumptions need not be contradictions.',
  familiarity:
    'The reading level useful for choosing follow-ups and resources. Technical vocabulary or familiarity is not itself evidence of reasoning quality.',
  horizon:
    'Whether the participant explicitly supplies a forecast horizon or capability milestone. This checks for timing evidence; it does not estimate the timeline itself.',
  conviction:
    'Whether the participant expresses the strength or uncertainty of their own belief. This is distinct from Jev’s confidence in its interpretation.',
  tension:
    'A consequential apparent incompatibility between related claims under the same scope and assumptions. Routing may investigate it without assuming it is a contradiction.',
  substantive:
    'Accepted replies that provide usable assessment evidence, including relevant uncertainty. Reply count does not determine readiness.',
  recovery:
    'Bounded handling of replies whose relevance or meaning cannot be established. Rejected replies stay in conversation history but never become profile evidence.',
  referenceIds:
    'Legacy or authoring links to corpus entries. Runtime corpus grounding is paused; these links do not affect new judgments or readiness.',
  contextReferenceIds:
    'Legacy contextual reference links, retained for saved-session compatibility. They do not affect the current inference flow.',
  evidenceReadiness:
    'A draft heuristic combining supported coverage and presence probability across 15 dimensions. It is not forecast accuracy or a reasoning-quality score.',
  threshold:
    'The draft readiness threshold at which a provisional result can be requested. It is a configurable development policy, not a scientific confidence cutoff.',
  contribution:
    'This dimension’s combined probability of stated or strongly implied support, halved when an ambiguity or tension remains. Repeating evidence does not add contribution.',
  interpretation:
    'A typed reading of participant evidence. It can remain uncertain or be superseded by a later explicit correction.'
} satisfies Explanations
const classifications = {
  stated:
    'The participant explicitly expresses relevant evidence, including a clearly stated uncertainty. This does not necessarily establish a directional outlook.',
  strongly_implied:
    'A clear implication supports this dimension without an explicit statement. It is less direct than a stated belief.',
  weakly_inferred:
    'Only indirect or uncertain support is available. This does not establish assessable coverage.',
  assessed:
    'Supported participant evidence is available for this dimension. This coverage label does not mean the belief is true or the reasoning is high quality.',
  unassessed:
    'No supported interpretation is established for this dimension. Missing evidence remains open and is never scored at the lowest level.',
  ambiguous:
    'Relevant language exists, but its meaning needs clarification. The application avoids filling in a position for the participant.',
  superseded:
    'A later explicit correction replaced this interpretation within the corrected scope. It is retained as history and excluded from active support.',
  disputed:
    'This support is contested and excluded from active support until clarified. It is not treated as established evidence.',
  assessable:
    'An expressed directional position can be interpreted on this dimension’s authored scale. Conditional or mixed expectations can still be assessable.',
  explicitly_unknown:
    'The participant states that they do not know and supplies no directional position. This remains unplaced rather than becoming a low score.',
  not_expressed:
    'No relevant interpretable evidence is expressed. This is missing information, not a negative judgment.',
  usable:
    'The reply supplies relevant interpretable evidence, including partial answers, humor with substance or genuine uncertainty. It can enter the assessment.',
  needs_clarification:
    'The intended meaning or relevance is unclear. The assessment re-asks neutrally rather than guessing a belief.',
  non_answer:
    'The reply clearly supplies no usable assessment evidence. Bounded recovery invites another try; repeated clear misses may reveal paperclips.',
  navigation:
    'The reply requests an action such as skipping, stopping or results. It is not worldview evidence.',
  interpret:
    'Interpret the current reply and establish evidence presence. Code then updates coverage and chooses whether to continue.',
  route:
    'Judge the independent benefits of eligible authored follow-ups. Application code combines those judgments to choose the next question.',
  project:
    'Interpret the final dimensions using the complete accepted transcript. Code calculates map coordinates and interpretation ranges.'
} satisfies Explanations
function lookup(explanations: Explanations, key: string) {
  return explanations[key]
}
function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}
export function recordedQuestion(value: unknown): Question | undefined {
  const question = record(value)
  return typeof question?.instructions === 'string' &&
    ['choice', 'score', 'noul'].includes(String(question.type))
    ? (question as Question)
    : undefined
}
export function questionBrief(question: Question) {
  return question.instructions
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(' ')
}
export function jsonHelp({
  property,
  value,
  parent,
  path,
  context,
  question
}: {
  property?: string
  value: unknown
  parent?: unknown
  path: string
  context: JsonHelpContext
  question?: Question
}): string | undefined {
  const own = record(value)
  const stored =
    recordedQuestion(own?.question) ??
    recordedQuestion(record(parent)?.question)
  const authored =
    stored ??
    (property && /\.(answers|questions)\./.test(path)
      ? context.questions?.[property]
      : undefined)
  if (
    authored &&
    (own?.question ||
      property === 'questionId' ||
      property === 'answer' ||
      context.questions?.[property!])
  )
    return questionBrief(authored)
  if (question && property && /\.(probabilities|criteria)\./.test(path)) {
    const criteria = question.criteria
    const explanation =
      criteria &&
      (Array.isArray(criteria)
        ? criteria[Number(property)]
        : (criteria as Record<string, string | null>)[property])
    if (explanation) return explanation
  }
  const vector = property === 'vector' ? value : own?.vector
  if (vector === 'outlook')
    return 'The horizontal Doom–Bloom projection: 45% expected benefits, 45% reversed expected harm and 10% valued human continuity. This is not P(doom) or a policy preference.'
  if (vector === 'epistemic')
    return 'The vertical projection of seven equally weighted demonstrated-reasoning dimensions. Missing evidence widens the range rather than lowering observed reasoning.'
  const dimension = context.dimensions?.find(
    (entry) =>
      entry.id === property ||
      entry.id === own?.vector ||
      (['vector', 'target', 'correctionTarget', 'clarificationTarget'].includes(
        property ?? ''
      ) &&
        entry.id === value)
  )
  if (dimension) {
    const classification =
      typeof value === 'string' ? lookup(classifications, value) : undefined
    return `${dimension.label}: ${classification ? `${dimension.meaning.split(/(?<=[.!?])\s+/)[0]} ${classification.split(/(?<=[.!?])\s+/)[0]}` : dimension.meaning}`
  }
  if (
    typeof value === 'string' &&
    ['status', 'choice', 'disposition', 'stage', 'kind', 'level'].includes(
      property ?? ''
    ) &&
    lookup(classifications, value)
  )
    return lookup(classifications, value)
  if (path.includes('.evidenceReadiness.')) {
    if (property === 'value')
      return 'The unrounded evidence-readiness percentage on a 0–100 scale. Eligibility uses this value, rather than the rounded number displayed in the meter.'
    if (property === 'confidence')
      return 'The highest combined probability of stated or strongly implied evidence attached to active whole-answer support for this dimension. Missing or ambiguous coverage contributes zero; repeated evidence is not added together.'
    if (property === 'ready')
      return 'Whether supported coverage crosses the draft threshold with both outlook and reasoning evidence. This permits a provisional result; it does not guarantee every final coordinate can be placed.'
    if (property === 'covered')
      return 'The number of dimensions with eligible presence support. This is coverage, not a count of high-quality scores.'
  }
  return property ? lookup(glossary, property) : undefined
}
