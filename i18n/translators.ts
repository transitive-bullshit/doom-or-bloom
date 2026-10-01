import {
  createTranslator,
  type Messages,
  type NamespaceKeys,
  type NestedKeyOf
} from 'next-intl'
import messages from '../messages/en.json'
import type { Locale } from './config'
import type { Translator } from './translator'

// Translators that need no request. Pages and components use getTranslations
// and useTranslations instead.

/**
 * English for output that stays English, such as API error bodies, and for
 * unit tests.
 */
export function englishTranslator<
  Scope extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(namespace?: Scope): Translator<Scope> {
  return createTranslator({
    locale: 'en',
    messages: messages as Messages,
    namespace
  }) as Translator<Scope>
}

/**
 * A translator for an explicit locale, for route handlers: they have no root
 * params, and unlike getTranslations this also runs outside a request.
 */
export async function translatorFor(locale: Locale): Promise<Translator> {
  const catalog = (await import(`../messages/${locale}.json`)).default
  return createTranslator({
    locale,
    messages: catalog as Messages
  }) as Translator
}
