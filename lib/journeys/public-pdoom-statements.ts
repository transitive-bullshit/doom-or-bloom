import type { z } from 'zod'
import type { publicProbabilityStatementSchema } from '@/lib/assessment/schema'

// Verified public statements. Applied only to simulated journey results, never to live assessment routing.
export const publicPdoomStatements: Record<
  string,
  z.infer<typeof publicProbabilityStatementSchema>
> = {
  'permissionless-innovation-optimist': {
    token: '≈0%',
    bounds: [0, 0],
    estimate: 0,
    title: 'AI Emergency Debate — The Diary of a CEO',
    url: 'https://singjupost.com/doac-ai-emergency-debate-ft-ed-zitron-andrew-mcafee-nate-soares-roman-yampolskiy-transcript/',
    publishedAt: '2026-09-17',
    outcome: 'Human extinction caused by AI',
    horizon: 'No fixed calendar horizon',
    conditions:
      'Rounded near-zero judgment, not impossibility. McAfee’s own turns at 00:06:14 and 01:39:54; third-party speaker-labeled transcript.',
    quote: 'It’s near zero. Never say never.'
  },
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
  },
  'grady-booch': {
    token: '≈0%',
    bounds: [0, 0],
    estimate: 0,
    title: 'My p(doom) remains asymptotically close to zero',
    url: 'https://x.com/grady_booch/status/2098149216803787067',
    publishedAt: '2026-09-10',
    outcome:
      'Not defined in the post; its context is humanity’s destruction by dangerous superintelligent AI',
    horizon: 'No horizon stated',
    conditions:
      'Verbal near-zero judgment (“asymptotically close to zero”), not a numeral or calculated estimate; “remains” marks a standing view. Recorded like the McAfee near-zero precedent. The same post respects much higher estimates while criticizing lab insiders.',
    quote: 'My p(doom) remains asymptotically close to zero.'
  },
  'liron-shapira': {
    token: '≈50%',
    bounds: [0.1, 0.9],
    estimate: 0.5,
    title:
      'I Raised an AI Investor’s P(Doom) Live On Air — Liron on Milk Road AI',
    url: 'https://lironshapira.substack.com/p/i-raised-an-ai-investors-pdoom-live',
    publishedAt: '2026-08-06',
    outcome:
      'Human extinction (whether we and our descendants are around at all); elsewhere he defines doom more broadly as permanently losing more than 99% of future value',
    horizon: 'Roughly by 2050',
    conditions:
      'All-things-considered ballpark including a chance of pausing; he says 50% really means a double-digit probability and has given 10–90% as his range (Feb 19, 2026). About 80% if superintelligence is built (Jan 27, 2026). Liron’s own turn at 00:03:12; recorded July 22, first aired July 27, 2026.',
    quote: 'My own probability is 50%.'
  },
  'holly-elmore': {
    token: '50–60%',
    bounds: [0.5, 0.6],
    title:
      'Let’s CALL OUT the AI Doom “Enablers” Joining OpenAI & Anthropic — Dr. Holly Elmore, PauseAI US',
    url: 'https://lironshapira.substack.com/p/holly-elmore-exposes-ai-doom-enablers',
    publishedAt: '2026-06-30',
    outcome:
      'AI disaster (“doom”) as asked on Doom Debates; she does not define the endpoint, and it is not an extinction-only figure',
    horizon: 'Not specified',
    conditions:
      'Subjective answer to “What’s your P(Doom)?” at 00:06:15–00:06:47 in the publisher transcript. She says she does not truly think in these terms, that any current risk is intolerable, that the figure has risen from her earlier estimates, and that she still puts 15–20% on getting lucky; in the same answer she says disaster is not necessarily more likely than not. Earlier, on the same show in September 2025, she gave roughly 20–40% for the worst outcomes (about 20% extinction).',
    quote: 'It’s probably 50 to 60% now. I used to be lower.'
  },
  'katja-grace': {
    token: '≈50%',
    bounds: [0.5, 0.5],
    estimate: 0.5,
    title: '314 - Guest: Katja Grace, AI Impact Researcher, part 2',
    url: 'https://aiandyou.net/e/314-guest-katja-grace-ai-impact-researcher-part-2/',
    publishedAt: '2026-06-22',
    outcome:
      'AI “doom” in her discussion of the probability that current AI development destroys the world; endpoint not further defined (the host’s follow-up paraphrases it as human extinction)',
    horizon: 'Not specified',
    conditions:
      'Approximate and variable (“it varies”, “maybe like”). She separates the default p(doom) from how much it can be changed and says she is pretty optimistic about changing it. Show-published PDF transcript without speaker labels; attribution follows the question–answer sequence. Not derived from her AI Impacts surveys, whose figures are other researchers’ answers.',
    quote: 'Well, it varies. I’d say maybe like 50 percent.'
  },
  'oliver-habryka': {
    token: '>50%',
    bounds: [0.5, 1],
    title: 'Comment on “A case for courage, when speaking of AI danger”',
    url: 'https://www.lesswrong.com/posts/CYTwRZtrhHuYf7QYu/a-case-for-courage-when-speaking-of-ai-danger?commentId=gmdQgZs2BiBgP9CQa',
    publishedAt: '2025-07-15',
    outcome: 'Superintelligence killing everyone (human extinction)',
    horizon:
      'No calendar horizon; conditional on superintelligence being deployed',
    conditions:
      'Conditional on deploying superintelligence; he says “much more than 50%” and that the claim needs more thinking through than the common at-least-10% argument. Not an estimate of whether deployment will happen. LessWrong comment, full text inspected.',
    quote:
      'much more than 50% probability that deploying superintelligence would kill everyone'
  },
  'kevin-roose': {
    token: '≈10%',
    bounds: [0.1, 0.1],
    estimate: 0.1,
    title:
      'AI Researchers Are Panicking | What Comes Next Is Worse Than Nuclear Bombs (Digital Disruption)',
    url: 'https://www.infotech.com/digital-disruption/ai-researchers-are-panicking-what-comes-next-is-worse-than-nuclear-bombs',
    publishedAt: '2026-09-21',
    outcome:
      'Everyone dying from AI (“how likely we all are to die from AI”); human extinction',
    horizon: 'No fixed calendar horizon',
    conditions:
      'His usual rough answer in his own turn of a speaker-labeled publisher transcript; he calls 10% an unacceptable existential risk and says the outcome depends on our response. His September 18 column says his p(doom) needle is moving higher without a number; a 10–15% remark on another podcast appears only in a mislabeled automatic transcript and is not used.',
    quote: 'I usually say mine is about 10%'
  },
  'nathan-labenz': {
    token: '10–90%',
    bounds: [0.1, 0.9],
    title:
      'Success without Dignity? Nathan finds Hope Amidst Chaos, from The Intelligence Horizon Podcast',
    url: 'https://www.cognitiverevolution.ai/success-without-dignity-nathan-finds-hope-amidst-chaos-from-the-intelligence-horizon-podcast/',
    publishedAt: '2026-04-01',
    outcome:
      'Unspecified AI “doom”; he does not define the endpoint (in January 2026 he contrasted post-scarcity utopia with “we’re all dead from AI”)',
    horizon: 'No fixed calendar horizon',
    conditions:
      'Deliberately wide subjective range in his own episode introduction (“remains”), repeated in his guest turn as what he usually says; he stresses shifting the odds over precision and says he has become somewhat more optimistic. Supersedes his January 22, 2026 AMA figure, “high single digit to low double digit range”.',
    quote: 'My p(doom) remains somewhere in the 10-90% range.'
  },
  aella: {
    token: '75%',
    bounds: [0.75, 0.75],
    estimate: 0.75,
    title:
      'They’re Making AI Doom Cool! Ft. AELLA, Brangus, Avalon Warren, Avisha NessAiver & Josh Thor of PlzDontKillUs',
    url: 'https://lironshapira.substack.com/p/plzdontkillus',
    publishedAt: '2026-08-26',
    outcome:
      '“Doom” as asked on Doom Debates (AI existential catastrophe); the exchange does not define the endpoint further',
    horizon: 'Not specified; she separately says timelines are probably short',
    conditions:
      'Unconditional answer to the host’s P(Doom) question at 00:29:50 in a host-published, speaker-labeled transcript; she later adds it is higher than she would like. Her remaining hope rests mainly on superintelligence taking an interest in consciousness, which she rates as unlikely. Distinct from her “nine out of 10 worried” rating and her 2022 essay.',
    quote: 'Seventy-five percent.'
  }
}
