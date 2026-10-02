import type { HubSource } from './citations'

/**
 * The thought leaders the P(doom) hub shows, in display order: stated numbers
 * from low to high, then prominent people who decline to give one. Stated
 * numbers are read from `publicPdoomStatements` by persona id when the page
 * renders; a person without a statement there is left out. The full catalog
 * lives on /users. Chosen in the October 2026 public P(doom) audit.
 */
export type CuratedPerson =
  | {
      /** Persona id, the key of `publicPdoomStatements`. */
      id: string
      /**
       * A short outcome, horizon or condition for the number. It applies only
       * while the statement still cites `url`; otherwise the row shows the
       * statement's own outcome.
       */
      note?: { url: string; text: string }
    }
  | {
      id: string
      /** An exact quote of under 15 words, shown instead of a number. */
      declined: { quote: string; note: string; source: HubSource }
    }

export const curatedPeople: CuratedPerson[] = [
  {
    id: 'anti-doomer',
    note: {
      url: 'https://www.cbsnews.com/news/jensen-huang-nvidia-rejects-ai-extinction-warnings/',
      text: 'The end of the world, by 2030'
    }
  },
  {
    id: 'world-model-optimist',
    note: {
      url: 'https://x.com/ylecun/status/2046577402264870958',
      text: 'Below the odds of an extinction-level asteroid strike'
    }
  },
  {
    id: 'bubble-critic',
    note: {
      url: 'https://singjupost.com/doac-ai-emergency-debate-ft-ed-zitron-andrew-mcafee-nate-soares-roman-yampolskiy-transcript/',
      text: 'Human extinction caused strictly by AI'
    }
  },
  {
    id: 'empirical-skeptic',
    note: {
      url: 'https://garymarcus.substack.com/p/why-my-pdoom-has-risen-dramatically',
      text: 'Catastrophe through misuse, reckless deployment or concentrated power'
    }
  },
  {
    id: 'independent-davidad',
    note: {
      url: 'https://www.cognitiverevolution.ai/alignment-with-awakening-davidad-on-moral-realism-ai-wisdom-why-his-p-doom-is-down-to-5/',
      text: 'Down from “the 70s” around 2022'
    }
  },
  {
    id: 'kevin-roose',
    note: {
      url: 'https://www.infotech.com/digital-disruption/ai-researchers-are-panicking-what-comes-next-is-worse-than-nuclear-bombs',
      text: 'Everyone dying from AI'
    }
  },
  {
    id: 'abundance-risk-taker',
    note: {
      url: 'https://singjupost.com/transcript-of-elon-musk-on-verdict-with-senator-ted-cruz-podcast-part-1/',
      text: 'Killer robots annihilating humanity'
    }
  },
  {
    id: 'concerned-pioneer',
    note: {
      url: 'https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize',
      text: 'Human extinction, within about 30 years'
    }
  },
  {
    id: 'rationalist-safety-advocate',
    note: {
      url: 'https://www.astralcodexten.com/p/my-ai-opinions',
      text: 'Human extinction caused by AI'
    }
  },
  {
    id: 'frontier-pacer',
    note: {
      url: 'https://www.axios.com/2025/09/17/anthropic-dario-amodei-p-doom-25-percent',
      text: 'Things going badly, broadly defined'
    }
  },
  {
    id: 'empirical-control-researcher',
    note: {
      url: 'https://www.dwarkesh.com/p/ryan-greenblatt',
      text: 'AI takeover by 2040'
    }
  },
  {
    id: 'independent-eli-lifland',
    note: {
      url: 'https://blog.controlai.org/p/special-edition-the-future-of-ai',
      text: 'Misaligned AI takeover, including about 25% for extinction'
    }
  },
  {
    id: 'katja-grace',
    note: {
      url: 'https://aiandyou.net/e/314-guest-katja-grace-ai-impact-researcher-part-2/',
      text: 'Current AI development destroying the world'
    }
  },
  {
    id: 'takeoff-forecaster',
    note: {
      url: 'https://singjupost.com/transcript-of-daniel-kokotajlo-interview-diary-of-a-ceo-podcast/',
      text: 'AI takeover or a similar catastrophe, if nothing changes'
    }
  },
  {
    id: 'independent-thezvi',
    note: {
      url: 'https://www.cognitiverevolution.ai/zvi-s-mic-works-recursive-self-improvement-live-player-analysis-anthropic-vs-dow-more/',
      text: 'Doom, not further defined'
    }
  },
  {
    id: 'tool-ai-moratorium',
    note: {
      url: 'https://lironshapira.substack.com/p/max-tegmark-vs-dean-ball-debate-ban-superintelligence',
      text: 'Loss of control, if there is no regulation'
    }
  },
  {
    id: 'independent-npcollapse',
    note: {
      url: 'https://pod.wave.co/podcast/the-peter-mccormack-show/201-connor-leahy-the-ai-that-escaped-inside-openais-rogue-agent-incident',
      text: 'On the current trajectory; “the future is not decided”'
    }
  },
  {
    id: 'control-alarmist',
    declined: {
      quote: 'There’s a lot of reasons I hate the ‘P(doom)’ concept',
      note: 'Ruin from superintelligence built with anything like current techniques: “Yes”',
      source: {
        title: 'There’s a lot of reasons I hate the “P(doom)” concept',
        url: 'https://x.com/ESYudkowsky/status/2101804209528271092',
        by: 'Eliezer Yudkowsky on X',
        year: 2026
      }
    }
  },
  {
    id: 'scientist-ai-advocate',
    declined: {
      quote: 'I’d rather stay out of the p(doom) game.',
      note: 'Gave 20% in 2023; now calls the risk “way too high for my taste”',
      source: {
        title:
          'Yoshua Bengio thinks he knows how to build safe superintelligence',
        url: 'https://80000hours.org/podcast/episodes/yoshua-bengio-scientist-ai/',
        by: '80,000 Hours',
        year: 2026
      }
    }
  },
  {
    id: 'scientific-steward',
    declined: {
      quote: 'it’s definitely non-zero and it’s probably non-negligible',
      note: 'Says a number would imply a precision that isn’t there',
      source: {
        title:
          'Transcript for Demis Hassabis: Future of AI, Simulating Reality, Physics and Video Games | Lex Fridman Podcast #475',
        url: 'https://lexfridman.com/demis-hassabis-2-transcript/',
        by: 'Lex Fridman Podcast',
        year: 2025
      }
    }
  },
  {
    id: 'cautious-builder',
    declined: {
      quote: 'I don’t know how you can put a number like that.',
      note: 'Calls taking a 10% chance of killing everybody unacceptable',
      source: {
        title:
          'Altman: AI Beyond Human Control “Absolutely” Possible, Vows Safeguards | Titans and Disruptors',
        url: 'https://www.youtube.com/watch?v=2my-NU6LuCM',
        by: 'Fortune',
        year: 2026
      }
    }
  }
]

/** Publishers of stated-number sources, for footnotes; unlisted hosts show the hostname. */
export const statementPublishers: Record<string, string> = {
  'aiandyou.net': 'AI and You',
  'astralcodexten.com': 'Astral Codex Ten',
  'axios.com': 'Axios',
  'blog.controlai.org': 'ControlAI',
  'cbsnews.com': 'CBS News',
  'cognitiverevolution.ai': 'The Cognitive Revolution',
  'dwarkesh.com': 'Dwarkesh Podcast',
  'garymarcus.substack.com': 'Marcus on AI',
  'infotech.com': 'Info-Tech Research Group',
  'lironshapira.substack.com': 'Doom Debates',
  'pod.wave.co': 'Wave',
  'singjupost.com': 'The Singju Post',
  'wbur.org': 'WBUR'
}
