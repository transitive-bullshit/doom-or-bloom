import 'server-only'
import type { Persona } from '@/lib/journeys/catalog'
import { participantRequest } from '@/lib/journeys/participant'
import type { AnswerStyle } from './personas'
import { openaiText } from './providers'
import type { Meter, OpenAIRequest } from './providers'

// The benchmark-only style, layered onto the shared simulated-participant
// instructions exactly as in the 2026-09-27 audit harness.
const briefStyle = '- brief: usually one everyday sentence'
const terseStyle =
  '- terse: like a hurried person typing on a phone who does not want to write much. Usually 1–10 words, often a fragment or lowercase (e.g. "probably bad for jobs", "idk, depends who controls it"). Give a reason only if the question explicitly asks why, and then only a few words. Never write multiple sentences.'

export type ParticipantTurn = {
  persona: Persona
  style: AnswerStyle
  prompt: { id: string; text: string }
  history: Array<{ question: string; answer: string }>
  recoveryGuidance: string | null
}

/** The simulated participant's request, with the benchmark's answer style. */
export function participantTurnRequest(turn: ParticipantTurn): OpenAIRequest {
  const request = participantRequest({
    persona: {
      ...turn.persona,
      responseStyle: turn.style === 'terse' ? 'brief' : turn.style
    },
    prompt: turn.prompt,
    history: turn.history,
    recoveryGuidance: turn.recoveryGuidance
  })
  if (turn.style !== 'terse') return request
  if (!request.instructions.includes(briefStyle))
    throw new Error(
      'The participant instructions changed; update the terse style in lib/benchmark/participant.ts'
    )
  const input = JSON.parse(request.input)
  input.background.responseStyle = 'terse'
  return {
    ...request,
    instructions: request.instructions.replace(
      briefStyle,
      `${terseStyle}\n${briefStyle}`
    ),
    input: JSON.stringify(input)
  }
}

export function participantAnswer(
  turn: ParticipantTurn,
  meter: Meter,
  tag: string
) {
  return openaiText(participantTurnRequest(turn), meter, tag)
}
