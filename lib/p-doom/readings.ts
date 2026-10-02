import type { HubSource } from './citations'

// The P(doom) hub's reading list: the essential case that AI could end in
// catastrophe, then the strongest critiques. Every link was loaded on
// 2026-10-02. Group headings are translated (`PdoomHub.readingGroups`); the
// entries stay English.

export type Reading = HubSource & {
  kind:
    | 'Book'
    | 'Essay'
    | 'Paper'
    | 'Report'
    | 'Scenario'
    | 'Statement'
    | 'Survey'
  /** One line, no final period. */
  description: string
}

export const readingGroups: {
  id: 'start' | 'core' | 'forecasts' | 'critiques'
  readings: Reading[]
}[] = [
  {
    id: 'start',
    readings: [
      {
        title:
          'If Anyone Builds It, Everyone Dies: Why Superhuman AI Would Kill Us All',
        url: 'https://ifanyonebuildsit.com/',
        by: 'Eliezer Yudkowsky and Nate Soares',
        year: 2025,
        kind: 'Book',
        description:
          'The most direct book-length case that building superintelligence with anything like current techniques ends in human extinction, and what survival would take'
      },
      {
        title: 'The Precipice: Existential Risk and the Future of Humanity',
        url: 'https://theprecipice.com/',
        by: 'Toby Ord',
        year: 2020,
        kind: 'Book',
        description:
          'Ord’s survey of existential risks, including his best guess of a 1 in 10 chance of existential catastrophe from unaligned AI within 100 years'
      },
      {
        title: 'AI 2027',
        url: 'https://ai-2027.com/',
        by: 'Daniel Kokotajlo, Scott Alexander, Thomas Larsen, Eli Lifland and Romeo Dean',
        year: 2025,
        kind: 'Scenario',
        description:
          'A detailed scenario of AI automating AI research around 2027, branching into a race ending with AI takeover and a slowdown ending'
      },
      {
        title: 'Statement on AI Extinction Risk',
        url: 'https://safe.ai/work/statement-on-ai-extinction-risk',
        by: 'Center for AI Safety',
        year: 2023,
        kind: 'Statement',
        description:
          'One sentence signed by Hinton, Bengio and the CEOs of OpenAI, Google DeepMind and Anthropic: AI extinction risk deserves priority alongside pandemics and nuclear war'
      }
    ]
  },
  {
    id: 'core',
    readings: [
      {
        title: 'Superintelligence: Paths, Dangers, Strategies',
        url: 'https://global.oup.com/academic/product/superintelligence-9780198739838',
        by: 'Nick Bostrom',
        year: 2014,
        kind: 'Book',
        description:
          'The book that framed the modern debate: intelligence explosion, the orthogonality thesis, instrumental convergence, and why controlling a superintelligence is hard'
      },
      {
        title:
          'Human Compatible: Artificial Intelligence and the Problem of Control',
        url: 'https://www.penguinrandomhouse.com/books/566677/human-compatible-by-stuart-russell/',
        by: 'Stuart Russell',
        year: 2019,
        kind: 'Book',
        description:
          'A co-author of the standard AI textbook argues that machines pursuing fixed objectives are dangerous, and proposes AI that stays uncertain about human preferences'
      },
      {
        title: 'AGI Ruin: A List of Lethalities',
        url: 'https://www.alignmentforum.org/posts/uMQ3cqWDPHhjtiesc/agi-ruin-a-list-of-lethalities',
        by: 'Eliezer Yudkowsky',
        year: 2022,
        kind: 'Essay',
        description:
          'Yudkowsky’s list of reasons he expects humanity to fail its first critical try at aligning superhuman AI; the classic very-high-P(doom) case'
      },
      {
        title: 'What failure looks like',
        url: 'https://www.alignmentforum.org/posts/HBxe6wdjxK239zajf/what-failure-looks-like',
        by: 'Paul Christiano',
        year: 2019,
        kind: 'Essay',
        description:
          'Christiano’s two failure stories: optimizing easy-to-measure proxies slowly erodes human control, and influence-seeking systems end in a sudden, correlated catastrophe'
      },
      {
        title: 'Is Power-Seeking AI an Existential Risk?',
        url: 'https://arxiv.org/abs/2206.13353',
        by: 'Joseph Carlsmith',
        year: 2022,
        kind: 'Paper',
        description:
          'A careful six-premise argument for existential catastrophe from power-seeking AI by 2070, with explicit credences: about 5%, later raised to over 10%'
      },
      {
        title: 'An Overview of Catastrophic AI Risks',
        url: 'https://arxiv.org/abs/2306.12001',
        by: 'Dan Hendrycks, Mantas Mazeika and Thomas Woodside',
        year: 2023,
        kind: 'Paper',
        description:
          'A clear map of catastrophic AI risk in four parts: malicious use, AI races, organizational risks and rogue AIs, with mitigations for each'
      },
      {
        title:
          'Gradual Disempowerment: Systemic Existential Risks from Incremental AI Development',
        url: 'https://arxiv.org/abs/2501.16946',
        by: 'Jan Kulveit et al.',
        year: 2025,
        kind: 'Paper',
        description:
          'Argues AI could permanently disempower humanity without an abrupt takeover, by replacing the human labor and cognition that keep economies, states and culture serving people'
      }
    ]
  },
  {
    id: 'forecasts',
    readings: [
      {
        title: 'Thousands of AI Authors on the Future of AI',
        url: 'https://arxiv.org/abs/2401.02843',
        by: 'Katja Grace et al.',
        year: 2024,
        kind: 'Survey',
        description:
          'Of 2,778 published AI researchers surveyed, between 38% and 51% gave at least a 10% chance of outcomes as bad as human extinction'
      },
      {
        title:
          'Forecasting Existential Risks: Evidence from a Long-Run Forecasting Tournament',
        url: 'https://forecastingresearch.org/research/existential-risk-persuasion-tournament',
        by: 'Ezra Karger, Philip E. Tetlock et al.',
        year: 2023,
        kind: 'Report',
        description:
          'Superforecasters and domain experts debated existential risks for months without converging; final medians for AI-caused extinction by 2100: 0.38% versus 3%'
      },
      {
        title: 'International AI Safety Report 2026',
        url: 'https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026',
        by: 'Yoshua Bengio (chair) et al.',
        year: 2026,
        kind: 'Report',
        description:
          'The Bengio-led review by over 100 experts, backed by over 30 countries and international organisations, of current evidence on general-purpose AI capabilities and risks'
      }
    ]
  },
  {
    id: 'critiques',
    readings: [
      {
        title:
          'AI existential risk probabilities are too unreliable to inform policy',
        url: 'https://www.normaltech.ai/p/ai-existential-risk-probabilities',
        by: 'Arvind Narayanan and Sayash Kapoor',
        year: 2024,
        kind: 'Essay',
        description:
          'Argues that inductive, deductive and subjective P(doom) estimates all lack a sound basis, making them too unreliable to guide public policy'
      },
      {
        title: 'AI as Normal Technology',
        url: 'https://www.normaltech.ai/p/ai-as-normal-technology',
        by: 'Arvind Narayanan and Sayash Kapoor',
        year: 2025,
        kind: 'Essay',
        description:
          'Argues AI is a transformative but normal technology whose effects unfold over decades, and that keeping it under human control needs no drastic intervention'
      },
      {
        title: 'Counterarguments to the basic AI x-risk case',
        url: 'https://aiimpacts.org/counterarguments-to-the-basic-ai-x-risk-case/',
        by: 'Katja Grace',
        year: 2022,
        kind: 'Essay',
        description:
          'An AI-risk researcher’s careful list of gaps in the basic x-risk argument, from whether AI will be goal-directed to how bad misaligned goals would be'
      }
    ]
  }
]
