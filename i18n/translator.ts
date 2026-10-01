import type {
  createTranslator,
  Messages,
  NamespaceKeys,
  NestedKeyOf
} from 'next-intl'

type Namespace = NamespaceKeys<Messages, NestedKeyOf<Messages>>

/**
 * The translator `useTranslations` and `getTranslations` return. Code in lib/
 * that builds participant-facing sentences takes one, so the same function
 * renders whole messages in any locale (and English in unit tests).
 */
export type Translator<Scope extends Namespace = never> = ReturnType<
  typeof createTranslator<Messages, Scope>
>
