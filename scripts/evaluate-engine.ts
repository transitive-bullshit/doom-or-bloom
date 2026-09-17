import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createLiveProvider } from '../lib/server/live-provider'
import { runAssessment } from '../lib/server/engine'
import { loadBundle } from '../lib/content/loader'
import { createAssessment, currentPrompt } from '../lib/assessment/state'
import type { Assessment, Operation } from '../lib/assessment/schema'
const bundle = loadBundle()
const model = process.env.TYPESAFE_MODEL || 'jev-1.13.0'
const provider = createLiveProvider(model)
const steps: unknown[] = []
async function step(state: Assessment, operation: Operation) {
  const response = await runAssessment(
    { requestId: randomUUID(), assessment: state, operation, debug: true },
    provider,
    bundle,
    true
  )
  const trace = response.debug!
  steps.push({
    operation: operation.type,
    prompt: currentPrompt(state).promptId,
    elapsedMs: trace.elapsedMs,
    stages: trace.stages.map((s) => ({
      name: s.name,
      questions: Object.keys(s.questions).length,
      elapsedMs: s.elapsedMs,
      inputBytes: s.inputBytes,
      outputBytes: s.outputBytes,
      usage: s.usage,
      attempts: s.attempts,
      model: s.model,
      disposition: s.answers.disposition ?? null
    })),
    next: {
      status: response.assessment.status,
      prompt: currentPrompt(response.assessment).promptId,
      substantive: response.assessment.answers.length,
      recovery: response.assessment.recovery
    },
    result: response.assessment.result,
    snapshotBytes: Buffer.byteLength(JSON.stringify(response.assessment))
  })
  console.log(
    `Completed ${operation.type}; ${trace.stages.length} stages; ${trace.elapsedMs} ms; ${response.assessment.status}`
  )
  return response.assessment
}
const answers = {
  root: 'I expect AI to help medicine and science substantially, but its overall impact is uncertain. AlphaFold improved protein structure prediction; that is useful evidence of scientific potential, not proof that drug development or safe general intelligence is solved. If AI tools help scientists test more hypotheses while institutions retain oversight, the gains could be large. Misuse and concentration of power could offset them.',
  'concrete.general':
    'In medicine, faster hypothesis generation and structure prediction could shorten parts of discovery. Trials and validation still take time. Benefits may go first to wealthy health systems unless access improves.',
  'timeline.general':
    'I expect increasingly capable systems over the next ten years. I do not know when autonomous general-purpose systems will be reliable, or whether they arrive at all. My confidence in a date is low.',
  'conviction.general':
    'My confidence is low. A ten-year horizon is an expectation rather than a precise prediction; reliability and experiments could delay it. I cannot justify a numerical probability.',
  'grounding.general':
    'AlphaFold at CASP14 demonstrated strong protein structure predictions. I use that as evidence for bounded scientific potential, not as proof that clinical trials or general safety are solved.',
  'mechanism.general':
    'AI could screen candidate compounds cheaply, reducing the experiments needed, but biological validation remains a bottleneck. So better prediction alone does not establish faster approval or cheaper patient care.',
  'control.general':
    'I think some monitoring and containment can help. Whether oversight remains effective for systems that can deceive evaluators is unresolved, so I would not infer safety from current benchmark success.',
  'governance.general':
    'Labs have incentives to ship quickly, while governments can require testing and incident reporting. I expect a mixed response because international competition makes coordinated restraint difficult.',
  'upside.general':
    'I expect material gains in scientific productivity and accessibility. Benefits depend on validation and broad access; capability improvements alone do not guarantee equal distribution.',
  'risk.general':
    'Misuse is already plausible. Loss of control could be catastrophic, but I cannot assign a reliable probability. My concern depends on future autonomy and whether safeguards can be independently tested.',
  'transition.general':
    'AI-assisted research could speed progress, but experiments, hardware and deployment are bottlenecks. A sudden transition is possible, although I do not treat feedback alone as proof of a runaway.',
  'agency.general':
    'A good future preserves meaningful human choice and accountability. I do not equate replacing people with flourishing; I would judge integration by whether people can consent and retain options.',
  'countercase.general':
    'A serious alternative is that reliability limits and physical bottlenecks slow change for decades. That would reduce both the benefits and some catastrophic risks in my forecast.',
  'crux.general':
    'I would become more optimistic if independent evaluations showed robust oversight under realistic autonomy. I would become more pessimistic after reproducible evidence of persistent deceptive behavior despite safeguards.',
  'tension.general':
    'My benefits claim is conditional on reliable tools and oversight, while my catastrophic-risk concern applies to more autonomous systems. Those are different scopes rather than a claim that the same deployment is both assuredly safe and unsafe.'
}
// Every authored variant gets an explicit synthetic family answer. These are
// development inputs, not human-authored holdout labels or generated summaries.
const familyAnswers = {
  transition: answers['transition.general']!,
  upside: answers['upside.general']!,
  risk: answers['risk.general']!,
  control: answers['control.general']!,
  governance: answers['governance.general']!,
  agency: answers['agency.general']!,
  action:
    'I would accept slower deployment to allow independent tests and broader access. That is a policy preference, not a claim that slower deployment guarantees a better outcome.',
  grounding: answers['grounding.general']!,
  crux: answers['crux.general']!,
  tension: answers['tension.general']!,
  scope:
    'My expectation depends on reliable tools and institutions preserving oversight. If those conditions fail, the benefits and my outlook change; I do not assume them guaranteed.',
  timeline: answers['timeline.general']!,
  mechanism: answers['mechanism.general']!
}
const syntheticAnswers = new Map(Object.entries(answers))
const familyLookup = new Map(Object.entries(familyAnswers))
for (const prompt of bundle.prompts) {
  const familyAnswer = familyLookup.get(prompt.family)
  if (!syntheticAnswers.has(prompt.id) && familyAnswer)
    syntheticAnswers.set(prompt.id, familyAnswer)
}
try {
  let state = createAssessment(randomUUID(), model)
  for (let i = 0; i < 8; i++) {
    const id = currentPrompt(state).promptId
    const text = syntheticAnswers.get(id)
    if (!text) throw new Error('Missing synthetic answer')
    state = await step(state, { type: 'answer', text })
    if (i === 2) state = await step(state, { type: 'project' })
    if (state.status === 'results' && i < 7)
      state = await step(state, { type: 'continue' })
  }
  state = await step(state, { type: 'project' })
  const target = state.result?.components.find(
    (c) => c.vector === 'technical_controllability' && c.value !== null
  )
  if (target) {
    state = await step(state, {
      type: 'clarify',
      vector: 'technical_controllability'
    })
    state = await step(state, {
      type: 'answer',
      text: 'I meant today’s testing is insufficient, not that technical control is impossible. I expect some methods to help, and I remain uncertain about their reliability for much more autonomous systems.'
    })
  }
  let recovery = createAssessment(randomUUID(), model)
  recovery = await step(recovery, {
    type: 'answer',
    text: 'Banana banana, my toaster is emperor of the moon.'
  })
  recovery = await step(recovery, {
    type: 'answer',
    text: 'Purple waffles dance with moon cheese.'
  })
  if (recovery.status === 'paused')
    recovery = await step(recovery, { type: 'retry' })
  recovery = await step(recovery, {
    type: 'answer',
    text: 'Sure, the robot overlords arrive Tuesday. Seriously, I expect AI to automate paperwork but I do not know whether the long-term benefits exceed the risks.'
  })
  await writeFile(
    'eval/live-engine.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        model,
        sdk: '0.6.0',
        purpose: 'Synthetic development smoke, not reviewed holdout validation',
        steps
      },
      null,
      2
    ) + '\n'
  )
} catch {
  await writeFile(
    'eval/live-engine.json',
    JSON.stringify(
      { date: new Date().toISOString(), model, failed: true, steps },
      null,
      2
    ) + '\n'
  )
  console.error(
    'Synthetic engine evaluation stopped. No credentials or transport error bodies logged.'
  )
  process.exitCode = 1
}
