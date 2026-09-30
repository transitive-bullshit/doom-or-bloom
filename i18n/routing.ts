import { defineRouting } from 'next-intl/routing'
import { defaultLocale, localeCookie, locales } from './config'

// There is no next-intl proxy: next.config applies these rules (see
// i18n/next-routes.ts). The cookie settings are used only by the browser when a
// visitor changes language; detection and alternate Link headers stay off.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie,
  alternateLinks: false
})
