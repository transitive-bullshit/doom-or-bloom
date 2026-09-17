// Exact workflow phrases only. Meaningful humor and AI arguments still need inference.
export function classifyLocalReply(text: string) {
  const normalized = text
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
  if (['test', 'test again'].includes(normalized)) return 'test_placeholder'
  if (['show me paperclips', 'show paperclips'].includes(normalized))
    return 'paperclip_request'
  return null
}
