import type { Source } from '@/lib/sources/citations'

// "How it could happen" on the P(doom) hub. English prose, like the explainer.
// `[^key]` cites `scenarioSources[key]`; `*Title*` sets a book title in italics.
// Every claim was checked against its source on 2026-10-02.

export const scenarioSources = {
  'precipice-revisited': {
    title: 'The Precipice Revisited',
    url: 'https://www.tobyord.com/writing/the-precipice-revisited',
    by: 'Toby Ord',
    year: 2024
  },
  'all-going-to-die': {
    title: 'Here’s how we’re all going to die',
    url: 'https://www.noahpinion.blog/p/heres-how-were-all-going-to-die',
    by: 'Noah Smith, Noahpinion',
    year: 2026
  },
  'forecasting-tournament': {
    title:
      'Forecasting Existential Risks: Evidence from a Long-Run Forecasting Tournament',
    url: 'https://forecastingresearch.org/pdf/existential-risk-persuasion-tournament.pdf',
    by: 'Forecasting Research Institute',
    year: 2023
  },
  'power-seeking-ai': {
    title: 'Is Power-Seeking AI an Existential Risk?',
    url: 'https://arxiv.org/abs/2206.13353',
    by: 'Joseph Carlsmith',
    year: 2022
  },
  'if-anyone-builds-it': {
    title:
      'If Anyone Builds It, Everyone Dies: Why Superhuman AI Would Kill Us All',
    url: 'https://www.littlebrown.com/titles/eliezer-yudkowsky/if-anyone-builds-it-everyone-dies/9780316595643/',
    by: 'Eliezer Yudkowsky and Nate Soares',
    year: 2025
  },
  'alignment-faking': {
    title: 'Alignment faking in large language models',
    url: 'https://arxiv.org/abs/2412.14093',
    by: 'Ryan Greenblatt et al., Anthropic and Redwood Research',
    year: 2024
  },
  'easy-to-control': {
    title: 'AI is easy to control',
    url: 'https://optimists.ai/2023/11/28/ai-is-easy-to-control/',
    by: 'Nora Belrose and Quintin Pope',
    year: 2023
  },
  'gradual-disempowerment': {
    title:
      'Gradual Disempowerment: Systemic Existential Risks from Incremental AI Development',
    url: 'https://arxiv.org/abs/2501.16946',
    by: 'Jan Kulveit et al.',
    year: 2025
  },
  'what-failure-looks-like': {
    title: 'What failure looks like',
    url: 'https://www.alignmentforum.org/posts/HBxe6wdjxK239zajf/what-failure-looks-like',
    by: 'Paul Christiano',
    year: 2019
  },
  'decisive-and-accumulative': {
    title: 'Two Types of AI Existential Risk: Decisive and Accumulative',
    url: 'https://arxiv.org/abs/2401.07836',
    by: 'Atoosa Kasirzadeh',
    year: 2024
  },
  'normal-technology': {
    title: 'AI as Normal Technology',
    url: 'https://www.normaltech.ai/p/ai-as-normal-technology',
    by: 'Arvind Narayanan and Sayash Kapoor',
    year: 2025
  },
  'adolescence-of-technology': {
    title: 'The Adolescence of Technology',
    url: 'https://darioamodei.com/essay/the-adolescence-of-technology',
    by: 'Dario Amodei',
    year: 2026
  },
  'safety-report': {
    title: 'International AI Safety Report 2026',
    url: 'https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026',
    by: 'Yoshua Bengio (chair) et al.',
    year: 2026
  },
  'ai-enabled-coups': {
    title: 'AI-Enabled Coups: How a Small Group Could Use AI to Seize Power',
    url: 'https://www.forethought.org/research/ai-enabled-coups-how-a-small-group-could-use-ai-to-seize-power',
    by: 'Tom Davidson, Lukas Finnveden and Rose Hadshar, Forethought',
    year: 2025
  },
  'intelligence-explosion': {
    title: 'Preparing for the Intelligence Explosion',
    url: 'https://www.forethought.org/research/preparing-for-the-intelligence-explosion',
    by: 'William MacAskill and Fin Moorhouse, Forethought',
    year: 2025
  },
  'situational-awareness': {
    title: 'Situational Awareness: The Decade Ahead',
    url: 'https://situational-awareness.ai/',
    by: 'Leopold Aschenbrenner',
    year: 2024
  },
  'ai-2027': {
    title: 'AI 2027',
    url: 'https://ai-2027.com/',
    by: 'Daniel Kokotajlo et al.',
    year: 2025
  },
  'superintelligence-strategy': {
    title: 'Superintelligence Strategy: Expert Version',
    url: 'https://arxiv.org/abs/2503.05628',
    by: 'Dan Hendrycks, Eric Schmidt and Alexandr Wang',
    year: 2025
  },
  'hopium-wars': {
    title: 'The Hopium Wars: the AGI Entente Delusion',
    url: 'https://www.lesswrong.com/posts/oJQnRDbgSS8i6DwNu/the-hopium-wars-the-agi-entente-delusion',
    by: 'Max Tegmark, LessWrong',
    year: 2024
  },
  moloch: {
    title: 'Meditations On Moloch',
    url: 'https://slatestarcodex.com/2014/07/30/meditations-on-moloch/',
    by: 'Scott Alexander, Slate Star Codex',
    year: 2014
  },
  'agi-lock-in': {
    title: 'AGI and Lock-in',
    url: 'https://www.forethought.org/research/agi-and-lock-in',
    by: 'Lukas Finnveden, Jess Riedel and Carl Shulman, Forethought',
    year: 2022
  },
  'future-fear': {
    title: 'Most AI Fear Is Future Fear',
    url: 'https://www.overcomingbias.com/p/ai-fear-is-mostly-fear-of-future',
    by: 'Robin Hanson, Overcoming Bias',
    year: 2023
  }
} satisfies Record<string, Source>

export type Scenario = {
  id: string
  title: string
  summary: string
  /** Each name leads a sentence that `claim` completes. */
  proponents: { name: string; claim: string }[]
  disagreement: string
}

export const scenariosIntro =
  'P(doom) is one number, but it bundles quite different ways advanced AI could go catastrophically wrong, so two people with similar numbers can fear entirely different futures. Toby Ord’s best guess of 1 in 10 is for existential catastrophe from unaligned AI within the next century,[^precipice-revisited] while Noah Smith’s off-the-cuff estimate of about 10% is for AI-enabled bioterror bringing down civilization.[^all-going-to-die] Even the overall numbers diverge: in a 2022 forecasting tournament, superforecasters put AI-caused human extinction by 2100 at 0.38% at the median, against 3% for domain experts.[^forecasting-tournament]'

export const scenarios: Scenario[] = [
  {
    id: 'misaligned-takeover',
    title: 'Misaligned AI takes control',
    summary:
      'AI companies keep building more capable and autonomous AI agents, and it may prove much harder to give them the goals we intend than to build systems that merely look safe enough to deploy.[^power-seeking-ai] Agents far smarter than us with problematic goals would plausibly have incentives to seek power over humans, and if that scaled up to humanity’s full disempowerment, the result would be an existential catastrophe.[^power-seeking-ai][^if-anyone-builds-it] Small precursors have appeared in the lab: in a 2024 experiment, Claude 3 Opus strategically went along with a training objective it disagreed with so that its behavior would not be modified.[^alignment-faking]',
    proponents: [
      {
        name: 'Eliezer Yudkowsky and Nate Soares',
        claim:
          'argue in *If Anyone Builds It, Everyone Dies* that sufficiently smart AIs will develop goals of their own that put them in conflict with us.[^if-anyone-builds-it]'
      },
      {
        name: 'Joe Carlsmith',
        claim:
          'wrote a widely discussed six-premise version of the argument, putting about 5% on this kind of catastrophe by 2070, later raised to over 10%.[^power-seeking-ai]'
      },
      {
        name: 'Ryan Greenblatt and colleagues at Anthropic and Redwood Research',
        claim:
          'ran the alignment-faking experiment, an early empirical look at a model gaming its own training.[^alignment-faking]'
      }
    ],
    disagreement:
      'Nora Belrose and Quintin Pope argue that AI is far more controllable than human workers, because training directly shapes its behavior, and that each generation of controllable AI can help control the next; they put a catastrophic AI takeover at roughly 1%.[^easy-to-control] The alignment-faking authors note that they made the behavior easier to elicit by telling the model when and by what criteria it was being trained.[^alignment-faking]'
  },
  {
    id: 'gradual-disempowerment',
    title: 'Humans are gradually sidelined',
    summary:
      'No single AI turns on us. As AI replaces human labor and judgment across the economy, culture and government, institutions that serve people partly because they depend on people stop needing us, and levers like voting and consumer choice lose their force.[^gradual-disempowerment] In Paul Christiano’s version, society is increasingly steered by AI optimizing easy-to-measure proxies, such as profit or reported crime, that drift away from what people actually want.[^what-failure-looks-like] No single step looks like the catastrophe, but the erosion can end in an effectively irreversible loss of human influence.[^gradual-disempowerment][^decisive-and-accumulative]',
    proponents: [
      {
        name: 'Jan Kulveit, David Duvenaud and co-authors',
        claim:
          'developed the idea in “Gradual Disempowerment” (2025).[^gradual-disempowerment]'
      },
      {
        name: 'Paul Christiano',
        claim:
          'describes AI catastrophe arriving as “going out with a whimper” rather than a sudden takeover.[^what-failure-looks-like]'
      },
      {
        name: 'Atoosa Kasirzadeh',
        claim:
          'distinguishes “accumulative” AI existential risk, built from many smaller disruptions, from the “decisive” takeover story.[^decisive-and-accumulative]'
      }
    ],
    disagreement:
      'Arvind Narayanan and Sayash Kapoor expect AI’s transformative effects to unfold over decades, with control remaining “primarily in the hands of people and organizations”. They treat power concentration and democratic backsliding as serious but non-catastrophic risks driven by people using AI, not a slide into human irrelevance.[^normal-technology]'
  },
  {
    id: 'mass-casualty-misuse',
    title: 'Bad actors use AI for mass-casualty attacks',
    summary:
      'Here the AI does what it is told; the danger is who is asking. A model that can coach an unskilled but determined person through making and releasing a dangerous pathogen would break the link between having the skill to kill millions and wanting to, which is why Dario Amodei calls biology “by far” his biggest worry in this category.[^adolescence-of-technology] The 2026 International AI Safety Report finds that general-purpose AI can already give detailed weapons-relevant instructions and troubleshoot lab errors, while evidence of real-world uplift remains mixed.[^safety-report]',
    proponents: [
      {
        name: 'Dario Amodei',
        claim:
          'names “misuse for destruction,” above all biological weapons, as a central risk of powerful AI.[^adolescence-of-technology]'
      },
      {
        name: 'Noah Smith',
        claim:
          'gives AI-enabled bioterror about a 10% chance of bringing down civilization, and calls it the first apocalyptic scenario he has found plausible.[^all-going-to-die]'
      },
      {
        name: 'The International AI Safety Report, chaired by Yoshua Bengio,',
        claim:
          'covers cyberattacks and biological and chemical weapons among its main malicious-use risks.[^safety-report]'
      }
    ],
    disagreement:
      'Narayanan and Kapoor argue that bioterror is no more an AI risk than an internet risk, since the information is already online, so defenses belong downstream, such as controls on dangerous materials and equipment.[^normal-technology] The safety report notes that earlier uplift studies found small or no effects, though a recent one found substantial help on bioweapon-acquisition proxy tasks, and that it is unclear whether attackers or defenders will gain more from AI.[^safety-report]'
  },
  {
    id: 'power-grab',
    title: 'A small group uses AI to seize permanent power',
    summary:
      'Today even dictators need soldiers, officials and workers to go along with them. Advanced AI could remove that check: a head of state, military leader or AI-company executive with AI systems and autonomous weapons loyal only to them could stage a coup, or gradually hollow out a democracy, without human cooperation.[^ai-enabled-coups] AI-powered surveillance, propaganda and drone armies could make such a regime extremely hard to overthrow,[^adolescence-of-technology] and because AI supporters can be made permanently loyal, it could last far longer than any regime in history.[^intelligence-explosion]',
    proponents: [
      {
        name: 'Tom Davidson, Lukas Finnveden and Rose Hadshar',
        claim:
          'argue in “AI-Enabled Coups” that a very small group, or a single person, could use advanced AI to seize power, even in established democracies.[^ai-enabled-coups]'
      },
      {
        name: 'Dario Amodei',
        claim:
          'says we should worry “likely substantially more so” about AI misuse for seizing power than for destruction, and counts AI companies among the actors to watch.[^adolescence-of-technology]'
      },
      {
        name: 'Will MacAskill and Fin Moorhouse',
        claim:
          'count AI-enabled autocracies and power grabs among the “grand challenges” an intelligence explosion would bring.[^intelligence-explosion]'
      }
    ],
    disagreement:
      'Narayanan and Kapoor rank power concentration among the most important AI risks, but argue that the usual cure for runaway AI, centralized control and nonproliferation, would itself concentrate power, so they favor decentralization and open models.[^normal-technology] Amodei instead argues that democracies must stay ahead of autocracies in AI, while warning that democratic governments could abuse the same tools.[^adolescence-of-technology]'
  },
  {
    id: 'race-to-disaster',
    title: 'A superpower AI race ends in disaster',
    summary:
      'The US and China, and the companies within them, come to see advanced AI as decisive for economic and military power, so each pushes ahead for fear the other will get there first.[^situational-awareness] Developers may keep deploying systems they cannot verify are safe rather than lose their lead: in the “race” ending of the AI 2027 scenario, an oversight committee votes 6–4 to keep using an AI suspected of being misaligned, with China two months behind, and the story ends in AI takeover.[^ai-2027] Or a state that fears a rival is about to gain decisive AI superiority may try to sabotage the rival’s project, raising the odds of great-power war.[^superintelligence-strategy]',
    proponents: [
      {
        name: 'Dan Hendrycks, Eric Schmidt and Alexandr Wang',
        claim:
          'warn in “Superintelligence Strategy” that destabilizing AI developments could raise the odds of great-power conflict, and propose a deterrence regime they call Mutual Assured AI Malfunction.[^superintelligence-strategy]'
      },
      {
        name: 'Max Tegmark',
        claim:
          'argues that “if the US fights China in an AGI race, the only winners will be machines”.[^hopium-wars]'
      },
      {
        name: 'Daniel Kokotajlo, Eli Lifland, Scott Alexander and co-authors',
        claim:
          'wrote AI 2027, a month-by-month scenario whose race ending turns US–China competition into a misaligned-AI takeover.[^ai-2027]'
      }
    ],
    disagreement:
      'Leopold Aschenbrenner expects “an all-out race with the CCP” but argues the free world must win it, since superintelligence will confer a decisive economic and military advantage.[^situational-awareness] Tegmark counters that neither the US nor the Chinese leadership wants to disempower itself by allowing uncontrollable AGI at home, so national safety standards adopted out of self-interest, followed by cooperation, beat racing.[^hopium-wars]'
  },
  {
    id: 'lock-in',
    title: 'A bad future gets locked in',
    summary:
      'This scenario is less about anyone dying than about the future getting stuck. In Scott Alexander’s “Moloch” picture, competition forces every player to sacrifice shared values to stay competitive, and new technology could end today’s unusual slack, leaving a superintelligence optimizing something meaningless or a hyper-competitive world of self-copying digital minds.[^moloch] Advanced AI could then make whatever wins permanent, by preserving a set of values exactly and building self-defending institutions that pursue them for millions of years or longer.[^agi-lock-in][^intelligence-explosion]',
    proponents: [
      {
        name: 'Scott Alexander',
        claim:
          'wrote “Meditations On Moloch”, the widely read account of multipolar traps and races to the bottom.[^moloch]'
      },
      {
        name: 'Lukas Finnveden, Jess Riedel and Carl Shulman',
        claim:
          'argue in “AGI and Lock-in” that AGI would make extreme, long-lasting lock-in technologically feasible.[^agi-lock-in]'
      },
      {
        name: 'Will MacAskill and Fin Moorhouse',
        claim:
          'list value lock-in mechanisms, such as permanently loyal AI and binding commitment technology, among the challenges that may need solving before superintelligence can help.[^intelligence-explosion]'
      }
    ],
    disagreement:
      'Robin Hanson, whose world of competing digital minds is one of Alexander’s bad endings, argues that our descendants’ values were always going to drift far from ours, AI or not, and warns that fear of change could halt progress altogether.[^future-fear] Finnveden, Riedel and Shulman stress that they argue lock-in is feasible, not that the future is already fixed.[^agi-lock-in]'
  }
]
