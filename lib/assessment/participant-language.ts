import {
  catalogCodes,
  defaultLocale,
  languageName,
  type CatalogCode
} from '@/i18n/config'
import type { Assessment, Operation } from './schema'

/**
 * The interview language Jev is told about: the locale submitted with this
 * reply, else the latest saved reply's. English, and replies saved before
 * algorithm 0.7.4, add nothing, so their Jev inputs are unchanged.
 */
export function participantLocale(
  state: Pick<Assessment, 'answers'>,
  operation: Operation
): CatalogCode | null {
  const locale =
    (operation.type === 'answer' && operation.locale) ||
    state.answers.at(-1)?.displayLocale
  return locale &&
    locale !== defaultLocale &&
    catalogCodes.some((code) => code === locale)
    ? (locale as CatalogCode)
    : null
}

/**
 * One neutral line of Jev context. Prompts, choices and rubric definitions
 * stay canonical English; answers are passed as written.
 */
export function participantLanguageNote(locale: CatalogCode) {
  return `The participant is using the interview in ${languageName(locale)}; answers may be written in any language. Judge meaning, not fluency or language.`
}
