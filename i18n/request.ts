import * as rootParams from 'next/root-params'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, isLocale } from './config'

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    // The locale is the root param of app/[locale]; reading it keeps pages
    // static. Local tools, admin and the global 404 have no locale param and
    // stay English, as does a path whose first segment is not a locale (see
    // app/[locale]/(site)/layout.tsx).
    const param = await rootParams.locale()
    locale = isLocale(param) ? param : defaultLocale
  }
  return {
    locale,
    timeZone: 'UTC',
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
