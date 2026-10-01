import { createTranslator, type Messages } from 'next-intl'
import de from '../messages/de.json'
import en from '../messages/en.json'
import es from '../messages/es.json'
import fr from '../messages/fr.json'
import hi from '../messages/hi.json'
import id from '../messages/id.json'
import ja from '../messages/ja.json'
import pt from '../messages/pt.json'
import th from '../messages/th.json'
import zh from '../messages/zh.json'
import type { Locale } from './config'
import type { Translator } from './translator'

const catalogs: Record<Locale, unknown> = {
  en,
  es,
  pt,
  hi,
  zh,
  th,
  ja,
  de,
  fr,
  id
}

/** A root translator for unit tests of code that builds localized text. */
export function testTranslator(locale: Locale): Translator {
  return createTranslator({
    locale,
    messages: catalogs[locale] as Messages
  }) as Translator
}
