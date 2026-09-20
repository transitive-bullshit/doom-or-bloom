import answers from './fixed-user-answers.json'
import type { Persona } from './catalog'

export const fixedUserAnswers = answers
export const fixedUserPersona: Persona = {
  id: 'real-user-regression',
  name: 'Real user · fixed answers',
  proxy: 'Original dictated answers · fixed transcript replay',
  description:
    'Four exact user-provided answers replayed through live Jev. Original questions are held fixed; the current router’s proposed next question is recorded but does not change this transcript.',
  concern:
    'Conditional worldview placement, false tension penalties, speech robustness and redundant follow-ups.',
  sources: [],
  familiarity: 'expert',
  responseStyle: 'detailed',
  background:
    'Fixed evidence supplied and authorized by the participant for local regression testing. No generated answers.',
  beliefs: [
    'Use only the original recorded answers. No persona generator is invoked.'
  ]
}
