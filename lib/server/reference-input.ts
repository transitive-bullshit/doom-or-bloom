import type { Reference } from '@/lib/content/schema'

export const referencePolicy =
  'Reference kinds, dates and related IDs are authored metadata. Dates may be qualified or unknown; do not replace occurrence dates with report or access dates. Related entries do not imply independent corroboration or supply facts from an omitted summary. Retrieved context is not evidence that the participant mentioned or understood a source.'

export function referenceMetadata(reference: Reference) {
  return {
    kind: reference.kind,
    date: reference.date,
    related: reference.related
  }
}
