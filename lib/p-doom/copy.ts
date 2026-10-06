import messages from '@/messages/en.json'

// The P(doom) hub and blog posts share one quotable definition. The hub and
// structured data use the English; a post's `<Definition />` reads
// `PdoomHub.definition` in the post's language (see docs/SEO.md).
export const pdoomDefinition = messages.PdoomHub.definition

/** The post the hub links to on why estimates vary and how to read one. */
export const pdoomGuidePath = '/blog/why-p-doom-estimates-vary'

/**
 * The guide's “How Doom or Bloom estimates P(doom)” section, linked from
 * result and profile P(doom) cards. `lib/blog/blog.test.ts` checks the
 * heading exists.
 */
export const pdoomMethodPath = `${pdoomGuidePath}#how-doom-or-bloom-estimates-pdoom`
