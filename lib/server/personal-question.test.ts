import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import type { Bundle } from '@/lib/content/loader'
import { createAssessment, forkAssessment } from '@/lib/assessment/state'
import type { Assessment, Operation } from '@/lib/assessment/schema'
import { autoStopFloor } from '@/lib/assessment/readiness'
import { personalPrompt } from '@/lib/assessment/routing'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'
import { runAssessment } from './engine'

const bundle = loadBundle()
// The same catalog without the personal question: today's routing.
const withoutPersonal: Bundle = {
  ...bundle,
  prompts: bundle.prompts.filter((prompt) => prompt.id !== personalPrompt)
}

/**
 * Fixture judgments that place the map (hopeful outlook, large change) and
 * raise no issues. `balance` leaves the overall balance unexpressed, so
 * routing asks `impact.overall`. While `control.pending` is set, one ranked
 * candidate (the first routing shortlists) clears the novelty threshold until
 * it is asked; no other candidate does.
 */
function judgments(options: { balance: boolean }) {
  const fixture = createFixtureProvider()
  const control = { pending: false, id: null as string | null }
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      const set = (id: string, option: string) => {
        if (questions[id])
          result.answers[id] = fixtureAnswer(questions[id], option)
      }
      set('facet:overall_outlook', options.balance ? 'not_expressed' : '3')
      set('facet:outlook_orientation', '3')
      set('experiment:transformation', '3')
      const novelty = Object.keys(questions).filter((id) =>
        id.endsWith(':novelty')
      )
      if (control.pending && !control.id && novelty[0])
        control.id = novelty[0].slice(0, -':novelty'.length)
      for (const id of novelty)
        result.answers[id] = {
          type: 'noul',
          noul: control.pending && id === `${control.id}:novelty` ? 0.9 : 0.02
        }
      return result
    }
  }
  return { provider, control }
}

let seq = 0
async function run(
  state: Assessment,
  operation: Operation,
  provider: Provider,
  catalog = bundle
) {
  return (
    await runAssessment(
      {
        requestId: `personal-${++seq}`,
        assessment: state,
        operation,
        debug: false
      },
      provider,
      catalog
    )
  ).assessment
}

async function answerAll(
  state: Assessment,
  texts: string[],
  provider: Provider,
  catalog = bundle
) {
  for (const text of texts)
    state = await run(state, { type: 'answer', text }, provider, catalog)
  return state
}

const asked = (state: Assessment) =>
  state.prompts.map((prompt) => prompt.promptId)
const timesAsked = (state: Assessment) =>
  asked(state).filter((id) => id === personalPrompt).length

const replies = [
  'Hopeful overall: AI will do much more good than harm, with real risks to manage.',
  'It will change the world a great deal, like electricity did.',
  'Maybe 5%.',
  'It already writes much of my code, and my job will become more about deciding what to build.',
  'Mostly cheaper medicine and faster science.',
  'If AI caused serious harm despite safety testing, I would worry much more.',
  'Governments will respond slowly, after something goes wrong.'
]

test('on the common path the personal question replaces the one ranked follow-up, with no extra question', async () => {
  const { provider } = judgments({ balance: false })
  // Nothing clears the novelty threshold, so the fourth question only fills
  // the answer floor.
  const before = await answerAll(
    createAssessment('common-before'),
    replies.slice(0, autoStopFloor),
    provider,
    withoutPersonal
  )
  expect(asked(before).slice(0, 3)).toEqual([
    'root',
    'transformation.ultimate',
    'risk.chance'
  ])
  expect(asked(before)).toHaveLength(autoStopFloor)
  expect(before.status).toBe('results')

  const after = await answerAll(
    createAssessment('common-after'),
    replies.slice(0, autoStopFloor),
    provider
  )
  expect(asked(after)).toEqual([
    'root',
    'transformation.ultimate',
    'risk.chance',
    personalPrompt
  ])
  expect(after.status).toBe('results')
  expect(after.result).not.toBeNull()
})

test('on the balance path results arrive unchanged, and the personal question is the first optional one', async () => {
  const { provider } = judgments({ balance: true })
  let state = await answerAll(
    createAssessment('balance'),
    replies.slice(0, autoStopFloor),
    provider
  )
  // An unasked personal question never holds back automatic results.
  expect(asked(state)).toEqual([
    'root',
    'impact.overall',
    'transformation.ultimate',
    'risk.chance'
  ])
  expect(state.status).toBe('results')
  state = await run(state, { type: 'continue' }, provider)
  expect(state.status).toBe('answering')
  expect(asked(state).at(-1)).toBe(personalPrompt)
  state = await run(state, { type: 'answer', text: replies[3]! }, provider)
  expect(state.status).toBe('results')
  // Continuing again explores ranked follow-ups; it is never repeated.
  state = await run(state, { type: 'continue' }, provider)
  expect(state.status).toBe('answering')
  expect(asked(state).at(-1)).not.toBe(personalPrompt)
  expect(timesAsked(state)).toBe(1)
})

test('a pending worthwhile follow-up keeps its place in line: the personal question takes its slot and it comes next', async () => {
  for (const path of ['common', 'balance'] as const) {
    const interview = async (catalog: Bundle) => {
      const { provider, control } = judgments({ balance: path === 'balance' })
      // On the common path the candidate is pending before the answer floor;
      // on the balance path it is pending at the floor, a fifth question.
      const lead = path === 'common' ? 2 : autoStopFloor - 1
      let state = await answerAll(
        createAssessment(`pending-${path}-${catalog.prompts.length}`),
        replies.slice(0, lead),
        provider,
        catalog
      )
      control.pending = true
      for (const text of replies.slice(lead))
        if (state.status === 'answering')
          state = await run(state, { type: 'answer', text }, provider, catalog)
      return { state, pending: control.id }
    }
    const before = await interview(withoutPersonal)
    const after = await interview(bundle)
    const slot = path === 'common' ? 3 : autoStopFloor
    expect(before.state.status).toBe('results')
    expect(after.state.status).toBe('results')
    expect(asked(before.state).slice(0, slot)).toEqual(
      asked(after.state).slice(0, slot)
    )
    expect(asked(before.state).slice(slot)).toEqual([before.pending])
    // The stop decision is unchanged, so the displaced follow-up is still
    // asked: the interview is one question longer.
    expect(asked(after.state).slice(slot)).toEqual([
      personalPrompt,
      after.pending
    ])
    expect(after.pending).toBe(before.pending)
  }
})

test('forks inherit the personal question, so it is asked at most once across the history', async () => {
  const { provider } = judgments({ balance: false })
  const answered = await answerAll(
    createAssessment('fork-source'),
    replies.slice(0, autoStopFloor),
    provider
  )
  expect(timesAsked(answered)).toBe(1)
  const fork = await run(
    forkAssessment(answered, 'fork-after-personal'),
    { type: 'continue' },
    provider
  )
  expect(asked(fork).at(-1)).not.toBe(personalPrompt)
  expect(timesAsked(fork)).toBe(1)

  // A fork of an interview that never reached it asks it first.
  const balance = await answerAll(
    createAssessment('fork-balance'),
    replies.slice(0, autoStopFloor),
    judgments({ balance: true }).provider
  )
  expect(timesAsked(balance)).toBe(0)
  const continued = await run(
    forkAssessment(balance, 'fork-before-personal'),
    { type: 'continue' },
    provider
  )
  expect(asked(continued).at(-1)).toBe(personalPrompt)
})

test('a skipped personal question is not asked again', async () => {
  const { provider } = judgments({ balance: false })
  let state = await answerAll(
    createAssessment('skip-personal'),
    replies.slice(0, 3),
    provider
  )
  expect(asked(state).at(-1)).toBe(personalPrompt)
  state = await run(state, { type: 'skip' }, provider)
  expect(asked(state).at(-1)).not.toBe(personalPrompt)
  expect(timesAsked(state)).toBe(1)
})

test('at the last slot a pending worthwhile follow-up keeps it', async () => {
  const { provider, control } = judgments({ balance: false })
  // A ceiling of four leaves one slot after the core map questions.
  let state = createAssessment('last-slot')
  state.promptCeiling = autoStopFloor
  state = await answerAll(state, replies.slice(0, 2), provider)
  control.pending = true
  for (const text of replies.slice(2))
    if (state.status === 'answering')
      state = await run(state, { type: 'answer', text }, provider)
  expect(asked(state)).toEqual([
    'root',
    'transformation.ultimate',
    'risk.chance',
    control.id
  ])
  expect(timesAsked(state)).toBe(0)
})
