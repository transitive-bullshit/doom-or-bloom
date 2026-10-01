import { createTranslator, type Messages } from 'next-intl'
import english from '../messages/en.json'
import spanish from '../messages/es.json'
import type { Locale } from './config'
import type { Translator } from './translator'

const catalogs: Record<Locale, unknown> = { en: english, es: spanish }

/** A root translator for unit tests of code that builds localized text. */
export function testTranslator(locale: Locale): Translator {
  return createTranslator({
    locale,
    messages: catalogs[locale] as Messages
  }) as Translator
}
