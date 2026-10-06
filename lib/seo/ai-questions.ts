/**
 * The questions the monthly AI-answer check asks (`pnpm seo:ai-citations`),
 * phrased neutrally, the way people ask them, and never naming the site.
 * Runs are compared by `id`, so keep an id when rewording its question and
 * give a new question a new id.
 */
export type AiQuestion = {
  id: string
  question: string
  /**
   * `core`: the site's key queries. `keywords`: searches from the keyword
   * study (docs/research/seo-keywords-2026-10-02.md).
   */
  group: 'core' | 'keywords'
}

export const aiQuestions: readonly AiQuestion[] = [
  { id: 'what-is-pdoom', question: 'What is P(doom)?', group: 'core' },
  {
    id: 'hinton-pdoom',
    question: "What is Geoffrey Hinton's P(doom)?",
    group: 'core'
  },
  {
    id: 'lecun-pdoom',
    question: "What is Yann LeCun's P(doom)?",
    group: 'core'
  },
  {
    id: 'yudkowsky-pdoom',
    question: "What is Eliezer Yudkowsky's P(doom)?",
    group: 'core'
  },
  {
    id: 'altman-ai-risk',
    question: "What is Sam Altman's view on AI risk?",
    group: 'core'
  },
  {
    id: 'pdoom-quiz',
    question: 'Is there a quiz that estimates my P(doom)?',
    group: 'core'
  },
  {
    id: 'ai-leaders-on-risk',
    question: 'What do AI leaders think about AI risk?',
    group: 'core'
  },
  {
    id: 'doomer-vs-accelerationist',
    question: 'AI doomer vs accelerationist',
    group: 'core'
  },
  { id: 'what-is-ai-doomer', question: 'What is an AI doomer?', group: 'core' },
  {
    id: 'expert-disagreement',
    question: 'Where do AI experts disagree about AI risk?',
    group: 'core'
  },
  {
    id: 'public-worry',
    question: 'How worried are people about AI?',
    group: 'core'
  },
  {
    id: 'researcher-pdoom-estimates',
    question: 'P(doom) estimates of AI researchers',
    group: 'core'
  },
  // The study's top opportunity: "<name> p doom" (a People also ask question).
  {
    id: 'musk-pdoom',
    question: "What is Elon Musk's P(doom)?",
    group: 'keywords'
  },
  // The largest question family the study found.
  {
    id: 'ai-take-over-world',
    question: 'Will AI take over the world?',
    group: 'keywords'
  },
  // Little demand, but the closest fit to the interview.
  { id: 'ai-doomer-quiz', question: 'AI doomer quiz', group: 'keywords' }
]
