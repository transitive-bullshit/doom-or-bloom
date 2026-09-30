import type { Locale } from './config'
import type messages from '../messages/en.json'

// English is the source catalog; every other catalog must have the same keys.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
