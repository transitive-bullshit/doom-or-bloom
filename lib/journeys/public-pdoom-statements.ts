import type { z } from 'zod'
import type { publicProbabilityStatementSchema } from '@/lib/assessment/schema'

// Verified public statements. Applied only to simulated journey results, never to live assessment routing.
export const publicPdoomStatements: Record<
  string,
  z.infer<typeof publicProbabilityStatementSchema>
> = {
  'rationalist-safety-advocate': {
    token: '20%',
    bounds: [0.2, 0.2],
    estimate: 0.2,
    title: 'My AI Opinions',
    url: 'https://www.astralcodexten.com/p/my-ai-opinions',
    publishedAt: '2026-06-11',
    outcome:
      'AI-caused human extinction, distinct from broader permanent curtailment of humanity’s future',
    horizon: 'No fixed calendar horizon',
    conditions:
      'Explicitly rounded personal P(doom), accounting for current safety effort and possible pauses. Not his conditional estimate without special safety work or the separate broader-curtailment estimate.',
    quote: 'I’m rounding both of them off to 20%.'
  },
  'empirical-control-researcher': {
    token: '35–40%',
    bounds: [0.35, 0.4],
    title: 'What happens once AI can automate AI research?',
    url: 'https://www.dwarkesh.com/p/ryan-greenblatt',
    publishedAt: '2026-08-11',
    outcome: 'AI takeover; not an extinction-only forecast',
    horizon: 'By 2040',
    conditions:
      'Subjective estimate across takeover scenarios. Distinct from his earlier broader catastrophe estimate, which also includes authoritarian human power grabs, and from his conditional extinction estimate.',
    quote: 'By 2040? Let’s see. Maybe around 35 or 40%?'
  },
  'concerned-pioneer': {
    token: '10\u201320%',
    bounds: [0.1, 0.2],
    title: 'The Godfather of AI says we cannot afford to get it wrong',
    url: 'https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize',
    publishedAt: '2025-01-10',
    outcome: 'Human extinction caused by AI',
    horizon:
      'Within approximately 30 years, in the interviewer\u2019s question that Hinton answers',
    conditions:
      'Subjective estimate; explicitly uncertain and revisable, not a measured probability Host repeats the old range. Hinton emphasizes that it is an intuitive guess, says caring-AI ideas have made him somewhat less scared, and does not state a new percentage.',
    quote: '10% to 20% seemed like reasonable numbers to me'
  },
  'empirical-skeptic': {
    token: '\u22483%',
    bounds: [0.03, 0.03],
    title: 'Why my p(doom) has risen, dramatically',
    url: 'https://garymarcus.substack.com/p/why-my-pdoom-has-risen-dramatically',
    publishedAt: '2025-07-15',
    outcome:
      'AI-related catastrophic danger discussed through misuse, reckless deployment and concentrated power; no exact extinction-only endpoint',
    horizon: 'Not specified',
    conditions:
      'Dated update after Grok-related concerns; hypothetical worst circumstances, not certainty',
    estimate: 0.03,
    quote: 'I am at maybe 3% now'
  },
  'frontier-pacer': {
    token: '25%',
    bounds: [0.25, 0.25],
    title: 'Amodei on AI: 25% chance things go badly',
    url: 'https://www.axios.com/2025/09/17/anthropic-dario-amodei-p-doom-25-percent',
    publishedAt: '2025-09-17',
    outcome: 'Broad AI catastrophe',
    horizon: 'Unspecified',
    conditions: 'Unspecified',
    estimate: 0.25
  },
  'tool-ai-moratorium': {
    token: '>90%',
    bounds: [0.9, 1],
    title: 'Max Tegmark vs. Dean Ball: Should We BAN Superintelligence?',
    url: 'https://lironshapira.substack.com/p/max-tegmark-vs-dean-ball-debate-ban-superintelligence',
    publishedAt: '2025-11-21',
    outcome: 'Loss of human control after superintelligence deployment',
    horizon: 'Not specified',
    conditions:
      'Explicitly conditional on continuing without predeployment safety regulation; not an unconditional prediction that regulation will fail to materialize',
    quote: 'When I said P(doom) of over 90%, that was if we do no regulation.'
  },
  'biosecurity-abundance-optimist': {
    token: '\u224810%',
    bounds: [0.1, 0.1],
    title: 'Here\u2019s how we\u2019re all going to die',
    url: 'https://www.noahpinion.blog/p/heres-how-were-all-going-to-die',
    publishedAt: '2026-08-28',
    outcome:
      'Civilization collapse from AI-enabled bioterrorism; not human extinction',
    horizon:
      'No numerical forecast horizon; the essay\u2019s illustrative scenario starts in 2029',
    conditions:
      'AI-enabled bioterrorism specifically; informal estimates rather than exhaustive all-cause AI risk Separately states 30% for world-changing destruction. Survivors and recovery remain distinct questions.',
    estimate: 0.1,
    quote: 'about a 10% chance of bringing down civilization'
  }
}
