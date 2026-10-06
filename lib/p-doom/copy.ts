// The P(doom) hub and the "Why P(doom) estimates vary so much" post share one
// quotable definition. Both bodies are English (see docs/SEO.md).
export const pdoomDefinition =
  'P(doom) is the probability a person assigns to advanced AI causing an existential catastrophe for humanity, such as human extinction or a permanent loss of control over our future.'

/** The post the hub links to on why estimates vary and how to read one. */
export const pdoomGuidePath = '/blog/why-p-doom-estimates-vary'

/**
 * The guide's “How Doom or Bloom estimates P(doom)” section, linked from
 * result and profile P(doom) cards. `lib/blog/blog.test.ts` checks the
 * heading exists.
 */
export const pdoomMethodPath = `${pdoomGuidePath}#how-doom-or-bloom-estimates-pdoom`
