// The mechanical part of the one-liner rule in
// docs/user-journeys.md#simulated-user-one-liners. Whether a line is fair and
// neutral still needs a careful read against the person's sources; these
// checks catch the slips a reader notices first.

/** Exact words the person published, checked against the linked source. */
export type VerifiedQuote = { quote: string; url: string }

const oneLinerLength = { min: 60, max: 150 }

// Outcomes a one-liner may name only inside a verified quote.
const outcomes =
  /\b(?:extinct(?:ion)?|kill(?:s|ed|ing)?|dies|die|death|doom\w*|takeover|catastroph\w*|existential|annihilat\w*|ends? humanity)\b/i

export function oneLinerProblems(text: string, quote?: VerifiedQuote) {
  const problems: string[] = []
  const { min, max } = oneLinerLength
  if (text.length < min || text.length > max)
    problems.push(`is ${text.length} characters, outside ${min}–${max}`)
  if (text !== text.trim() || /\s{2}|\n/.test(text))
    problems.push('has stray whitespace')
  if (!/^[A-Z0-9“]/.test(text)) problems.push('does not start with a capital')
  if (!text.endsWith('.')) problems.push('does not end with a period')
  if (text.split(/[.?!]”?\s+(?=[A-Z“])/).length > 2)
    problems.push('has more than two sentences')
  if (/[;—]/.test(text)) problems.push('uses a semicolon or dash')
  if (quote && !text.includes(`“${quote.quote}`))
    problems.push('does not quote its verified words exactly')
  // Everything outside the verified quote is our paraphrase.
  const paraphrase = text.replace(/“[^”]*”/g, (span) =>
    quote && span.startsWith(`“${quote.quote}`) ? '' : span
  )
  if (/[“”"]/.test(paraphrase))
    problems.push('quotes words that are not a verified quote')
  if (/%|p\(doom\)/i.test(paraphrase))
    problems.push('states a P(doom) or percentage')
  const outcome = paraphrase.match(outcomes)?.[0]
  if (outcome) problems.push(`names an outcome (“${outcome}”) outside a quote`)
  return problems
}
