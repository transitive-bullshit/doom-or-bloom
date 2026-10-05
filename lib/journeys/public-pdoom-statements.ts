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
  },
  'takeoff-forecaster': {
    token: '≈70%',
    bounds: [0.7, 0.7],
    estimate: 0.7,
    title: 'Transcript of Daniel Kokotajlo Interview: Diary Of A CEO Podcast',
    url: 'https://singjupost.com/transcript-of-daniel-kokotajlo-interview-diary-of-a-ceo-podcast/',
    publishedAt: '2026-07-13',
    outcome:
      'AI takeover or a comparably very big catastrophe on the default path “if things don’t change”; explicitly not an extinction-only estimate',
    horizon: 'Not specified; a forecast for the current default path',
    conditions:
      "Subjective and rounded ('something like 70%'), on the default path 'if things don’t change'. He corrects the host’s '70% chance of human extinction': AIs might take over without killing everyone. Says 'I don’t think that we’re definitely doomed'. Third-party speaker-labelled transcript (Singju Post) of the episode published 2026-07-13. Same figure as his April 2025 Dwarkesh statement ('my P(doom) is sort of infamously high, like 70%'). A later interview (Jan Jekielek, premiered 2026-09-26) answers the P(doom) question only qualitatively ('probably this will end poorly').",
    quote: '70% chance of something like AIs taking over'
  },
  'abundance-risk-taker': {
    token: '10–20%',
    bounds: [0.1, 0.2],
    title: 'ELON MUSK JOINS VERDICT - PART 1 | Verdict Ep. 214',
    url: 'https://www.youtube.com/watch?v=BDREZmpkIz8',
    publishedAt: '2025-03-17',
    outcome:
      '“Killer robots annihilating humanity”, in Ted Cruz’s question; the complement he names is about 80% “extreme prosperity for all”',
    horizon:
      'About 5–10 years; his answer to “On what time frame?” reads “after to 10 years” in the official upload’s automatic captions and “five to ten years” in press quotations',
    conditions:
      'Off-the-cuff, rounded answer: “20% likely, maybe 10%”, then calls the glass “80 to 90% full, meaning like 80% likely” extreme prosperity for all. Words checked against the automatic captions of the show’s official YouTube upload and Transformer’s quotation (2025-03-21); Singju Post’s third-party transcript renders the answer as “Likely, maybe 10%”. Consistent with JRE #2281 (2025-02-28), where a good outcome is “like 80% likely”. In The Economist’s July 2026 interview, asked whether 10–20% still holds, he said the risk is “not zero” without restating or replacing the number.',
    quote: '20% likely, maybe 10%'
  },
  'alignment-philosopher': {
    token: '≥10%',
    bounds: [0.1, 0.99],
    title: 'Leaving Open Philanthropy, going to Anthropic',
    url: 'https://joecarlsmith.com/2025/11/03/leaving-open-philanthropy-going-to-anthropic/',
    publishedAt: '2025-11-03',
    outcome:
      'The technology being built by companies like Anthropic destroying the entire future of the human species (existential catastrophe)',
    horizon: 'Not specified',
    conditions:
      "Verbal numeric category ('significant (read: double-digit)'), not a point estimate or narrow range; do not render as 10% or a midpoint. Speaking only for himself, not Anthropic. Consistent with his earlier '>10%' updates (May 2022 note on the 2021 report; 2023 shorter version); his original ~5% by 2070 was disowned as too low.",
    quote:
      'a significant (read: double-digit) probability of destroying the entire future of the human species'
  },
  'independent-thezvi': {
    token: '≈70%',
    bounds: [0.7, 0.7],
    estimate: 0.7,
    title:
      "Zvi's Mic Works! Recursive Self-Improvement, Live Player Analysis, Anthropic vs DoW + More!",
    url: 'https://www.cognitiverevolution.ai/zvi-s-mic-works-recursive-self-improvement-live-player-analysis-anthropic-vs-dow-more/',
    publishedAt: '2026-03-19',
    outcome:
      'AI “doom” as asked by Nathan Labenz (“your latest P doom”); endpoint not defined in the exchange (his discussion is about superintelligence ending up with goals we do not want)',
    horizon: 'No fixed calendar horizon',
    conditions:
      'His own turn near the end of the episode, answering Labenz’s request for a P(doom) update, in the publisher’s speaker-labelled (automatic, lowercase, partly garbled) transcript. Deliberately one significant digit; he says the update is “kind of a wash”: Anthropic’s virtue-basin approach is more promising than expected, but speed and the Department of War fight offset it. Restates the figure from his previous appearance (Sept 2025). Implicitly reaffirmed in Pick Your Poison (Cognitive Revolution, 2026-08-05), where he says a do-what-the-user-wants alignment world “would not make me update down from 70%”. Not the host’s paraphrase.',
    quote: "i think it's like yeah seventy ish"
  },
  'independent-eli-lifland': {
    token: '≈50%',
    bounds: [0.5, 0.5],
    estimate: 0.5,
    title: 'Special Edition: The Future of AI and Humanity, with Eli Lifland',
    url: 'https://blog.controlai.org/p/special-edition-the-future-of-ai',
    publishedAt: '2025-04-10',
    outcome:
      'Misaligned AI takeover; his extinction estimate within it is roughly 25%',
    horizon: 'Not specified',
    conditions:
      'His own answer (“Eli:”) in ControlAI’s published interview, asked how likely the extinction threat is. Both figures are rough. Not the 75% he gives for takeover conditional on the fast, closely raced AI 2027 scenario. In AXRP 50 (2026-08-03, 02:03:17) he says extinction conditional on misaligned takeover is under 50%, consistent with 25/50; no newer overall number found, and his timelines have lengthened since (2032 automated-coder median). Editor may prefer the extinction figure (≈25%) if the page means extinction.',
    quote:
      'Roughly 25% on extinction, which is a subset of roughly 50% on misaligned takeover.'
  },
  'independent-davidad': {
    token: '<5%',
    bounds: [0, 0.05],
    title:
      'Alignment with Awakening: Davidad on Moral Realism, AI Wisdom, & why His p(Doom) is Down to 5%',
    url: 'https://www.cognitiverevolution.ai/alignment-with-awakening-davidad-on-moral-realism-ai-wisdom-why-his-p-doom-is-down-to-5/',
    publishedAt: '2026-07-12',
    outcome:
      'Residual AI doom, which he decomposes into being wrong about the wisdom attractor, Malthusian competition for land and energy (~1%), catastrophic (bio) misuse (~1%), a military first strike, and conflict between strong but violent AI coalitions',
    horizon: 'No fixed calendar horizon',
    conditions:
      'His own turn at [1:04:02] in the publisher’s timestamped, speaker-labelled transcript; later says these risks “fit into my 5%” [1:55:52] and “I’ve come down to five” [2:08:58], so the editor could render it ≈05%. Excludes a separate 20–30% for a non-catastrophic but somewhat dystopian concentration of power [1:08–1:10] and the biological-human disempowerment he expects but does not count as doom. He calls even this “extremely risky”.',
    quote: 'I like my, my P doom is less than 5% now.'
  },
  'independent-npcollapse': {
    token: '≈99%',
    bounds: [0.99, 0.99],
    estimate: 0.99,
    title:
      "#201 - Connor Leahy - The AI That Escaped: Inside OpenAI's Rogue Agent Incident (The Peter McCormack Show)",
    url: 'https://pod.wave.co/podcast/the-peter-mccormack-show/201-connor-leahy-the-ai-that-escaped-inside-openais-rogue-agent-incident',
    publishedAt: '2026-08-14',
    outcome:
      'Things going poorly on the current trajectory toward superintelligence; in context, human extinction. Stated relative to Nate Soares, whom he puts at “maybe like 99”, and followed at once by “the future is not decided”',
    horizon: 'Not specified',
    conditions:
      'Conditional on continuing the current trajectory; he immediately insists “the future is not decided”. Stated relationally at [60:44–60:49] (host: “I think Nate Soares is 100”; Connor: “Surely not 100. Maybe like 99.”): asked if it is above 20%, “Yes”; 100%, “No”; he puts Nate Soares at “maybe like 99” and his own within rounding error of that. Source is Wave’s machine transcript with speaker labels (not show-published); attribution follows an unambiguous question–answer sequence. Supersedes his June 2025 figure of 50–80% extinction or near-extinction within 50 years “if we do literally nothing” (The Great Simplification #184, publisher speaker-labelled transcript at 00:58:13, recorded 2025-05-21) — use that cleaner but older statement if a machine transcript is not acceptable.',
    quote: 'very, very high, within rounding error of Nate or whatever'
  },
  'independent-robertskmiles': {
    token: '10–90%',
    bounds: [0.1, 0.9],
    title:
      'Rob Miles, Top AI Safety Educator: Humanity Isn’t Ready for Superintelligence!',
    url: 'https://lironshapira.substack.com/p/rob-miles-top-ai-safety-communicator',
    publishedAt: '2025-08-23',
    outcome:
      'Unspecified AI “doom” as asked on Doom Debates (AI existential catastrophe); he does not define the endpoint',
    horizon: 'No fixed calendar horizon',
    conditions:
      "His own answer at 00:21:58 in the host-published, speaker-labelled transcript: he says “I don't know” and that anyone below 10% or above 90% is overconfident, so this is a defensible range rather than a point estimate. At 00:27:31–00:30:50 he says his P(doom) is “hugely variable”, driven by how humanity responds: “totally fine” if we make the right choices, “totally fucked” if we ignore it. He does not confirm the host’s suggestion that he is in the “50 plus zone”. He also argues the exact number is the wrong focus.",
    quote: 'any number in the 10 to 90% range is plausibly defensible'
  },
  'independent-rokomijic': {
    token: '35–40%',
    bounds: [0.35, 0.4],
    title:
      "The scary thing about P(Doom) is that if Lab CEOs are saying 10%, you know that's not the real number.",
    url: 'https://x.com/RokoMijic/status/2103594224616681791',
    publishedAt: '2026-09-25',
    outcome:
      'AI doom; in a reply he describes superhuman AI covering Earth in data centers and reactors and hunting humans down — human extinction',
    horizon:
      'This century, with most of the risk in the next 15 years on a laissez-faire trajectory (his reply of 2026-09-26)',
    conditions:
      'His all-things-considered figure, including “a determined effort to reduce it” and his expectation of aggressive AI regulation; on the current laissez-faire trajectory he puts it at “probably more like 95%” (conditional). Ten minutes later he replied “Okay maybe 35% ... 35 +-5% is not much difference” (https://x.com/RokoMijic/status/2103596881414881596), hence the range. All posts fetched via api.fxtwitter.com.',
    quote:
      'I personally think that 40% is reasonable with a determined effort to reduce it'
  },
  'bubble-critic': {
    token: '0%',
    bounds: [0, 0],
    estimate: 0,
    title:
      'DOAC AI Emergency Debate: ft. Ed Zitron, Andrew McAfee, Nate Soares & Roman Yampolskiy (Transcript)',
    url: 'https://singjupost.com/doac-ai-emergency-debate-ft-ed-zitron-andrew-mcafee-nate-soares-roman-yampolskiy-transcript/',
    publishedAt: '2026-09-17',
    outcome:
      'Human extinction caused strictly by AI, as asked in the debate’s opening envelope question',
    horizon: 'No fixed calendar horizon',
    conditions:
      'His own turn at 00:05:53 in a third-party speaker-labelled transcript (same source as the verified McAfee entry); the host confirms “we’ve got 99%, 0%”. He excludes a data-centre-driven climate disaster, which he says could potentially eradicate humanity. Near the end (02:20:51), asked about a more-than-10% chance of “existential harm” within about ten years, he says “I mean, look, 1%” before pivoting to non-existential harms; that hedged answer to a broader question is not used as the headline figure. Elsewhere he calls insiders’ probabilities meaningless.',
    quote: 'if we’re talking strictly about AI, I stand at zero'
  },
  'world-model-optimist': {
    token: '≈0%',
    bounds: [0, 0.0001],
    title: "I didn't say p(doom) was zero",
    url: 'https://x.com/ylecun/status/2046577402264870958',
    publishedAt: '2026-04-21',
    outcome:
      'Undefined “p(doom)”; he benchmarks it against an extinction-level asteroid impact and says it is far less likely than a nuclear holocaust',
    horizon:
      'No fixed calendar horizon; the next-millennium window belongs to the asteroid comparison',
    conditions:
      'Verbal upper bound, not a numeral: p(doom) is smaller than the probability of an extinction-level asteroid strike in the next millennium, offered because “everyone insists on pulling numbers out of thin air”. Recorded as near zero on the McAfee and Booch precedent; the bounds cap it at 0.01%, a loose reading of the asteroid comparison. In the same post he says he did not say p(doom) was zero, that all estimates are pulled out of thin air, and that a probability makes little sense for an event we have agency over. Reply to a post relaying Hassabis’s claim that LeCun thinks it is 0%. Full post text read via api.fxtwitter.com.',
    quote:
      'p(doom) is smaller than the probability of an extinction-level asteroid hitting the earth'
  },
  'anti-doomer': {
    token: '0% by 2030',
    bounds: [0, 0],
    estimate: 0,
    title:
      'Nvidia\'s Jensen Huang rejects AI extinction warnings as "doomsday narratives"',
    url: 'https://www.cbsnews.com/news/jensen-huang-nvidia-rejects-ai-extinction-warnings/',
    publishedAt: '2026-09-20',
    outcome:
      'AI bringing about “the end of the world”, in answer to claims that AI could kill everyone by the end of the decade',
    horizon: 'By 2030; he gives no longer-horizon number',
    conditions:
      'Categorical rhetorical dismissal in his own quoted words, not a calculated estimate: he says such predictions are “not grounded in science”. It covers only the period to 2030, and he gives no longer-horizon number. Quoted in the interviewing outlet’s own write-up of Jo Ling Kent’s interview, recorded Friday 2026-09-18; the 46-minute extended video was not opened. In a search-result excerpt of a podscripts transcript of his 2026-09-23 Ezra Klein Show interview (not fetched), he attacks Hinton’s 10% figure without offering a number of his own.',
    quote: "There is 0% chance that's going to be the end of the world"
  },
  'open-science-realist': {
    token: '≈0%',
    bounds: [0, 0],
    estimate: 0,
    title: 'One resignation turned the embers of AI fear into a wildfire',
    url: 'https://www.interconnects.ai/p/one-resignation-turned-the-embers',
    publishedAt: '2026-09-10',
    outcome:
      'Complete human extinction from AI. He separately treats AI-caused disasters (cyberattacks on critical infrastructure, bio-risks) as worth debating',
    horizon: 'Not specified',
    conditions:
      'Verbal judgment, no numeral: extinction is “so low it isn’t worth discussing”. Recorded as near-zero on the McAfee and Booch precedent, but the wording is less explicit than “near zero”. It is not a claim that AI is safe or that serious AI disasters are negligible. In the same essay he says “estimating annihilation is useless.” Full text read via the Substack API.',
    quote:
      'I put the probability of complete extinction as being so low it isn’t worth discussing'
  },
  'independent-jd-pressman': {
    token: '12%',
    bounds: [0.12, 0.12],
    estimate: 0.12,
    title: 'Varieties Of Doom',
    url: 'https://www.lesswrong.com/posts/apHWSGDiydv3ivmg6/varieties-of-doom',
    publishedAt: '2025-11-17',
    outcome:
      'Undefined “doom”; he says the term conflates several distinct AI outcomes, which the essay separates into layers. Not an extinction-only forecast',
    horizon: 'Not specified',
    conditions:
      'Self-reported figure he says he would sometimes give in private conversations, disclosed in his own essay with the caveat that “doom” is nebulous. In the same passage he says he had declined to give anything interpretable as a p(doom) in public until he could explain the layers of doom, which this essay sets out to do; the essay does not restate 12% as a fresh all-things-considered number. Separately he puts the “paperclipper” (successor that retains nothing of value) outcome in the sub-1% range. LessWrong publication date; a blog copy is dated 2025-10-27.',
    quote: "In private conversations I'd sometimes give my p(doom) as 12%"
  },
  'emad-mostaque': {
    token: '≈20%',
    bounds: [0.2, 0.2],
    estimate: 0.2,
    title: 'Intelligence isn’t a crime',
    url: 'https://x.com/EMostaque/status/2098909197265985802',
    publishedAt: '2026-09-12',
    outcome:
      'His “long-term p(Doom)”, not further defined here. Earlier, when he gave 50%, he described doom as more capable AI systems wiping humanity out',
    horizon: 'Long-term; no calendar horizon given for the 20%',
    conditions:
      'Revised down from the 50% he gave from December 2024 through April 2026 interviews; he says he first gave 20% on that week’s Moonshots episode, which was not inspected, and promised more detail. Stated in his own X article responding to Dario Amodei’s frontier-pacing essay; full text read via the X API.',
    quote: "down to 20% now as said on this week's Moonshots"
  }
}
