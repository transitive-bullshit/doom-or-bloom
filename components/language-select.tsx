'use client'
import { useLocale, useTranslations } from 'next-intl'
import { LanguagesIcon } from 'lucide-react'
import {
  isLocale,
  localeCookieString,
  localeOptions,
  localizedPath
} from '@/i18n/config'
import { usePathname } from '@/i18n/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

/** Footer language choice: remembers it for unprefixed URLs, keeps the page. */
export function LanguageSelect() {
  const locale = useLocale()
  const t = useTranslations('Footer')
  // Unprefixed route path, e.g. /users/simonw on both /users/simonw and /es/users/simonw.
  const pathname = usePathname()
  return (
    <Select
      value={locale}
      onValueChange={(next) => {
        if (!isLocale(next) || next === locale) return
        // Written here, never by a page response, so pages stay CDN-cacheable.
        document.cookie = localeCookieString(
          next,
          window.location.protocol === 'https:'
        )
        const { search, hash } = window.location
        // A full load swaps the root layout, <html lang> and the client catalog.
        window.location.replace(
          `${localizedPath(pathname, next)}${search}${hash}`
        )
      }}
    >
      <SelectTrigger
        size='sm'
        aria-label={t('language')}
        className='border-0 bg-transparent text-base text-muted-foreground shadow-none hover:text-foreground focus-visible:text-foreground dark:bg-transparent dark:hover:bg-transparent [&_svg:not([class*=text-])]:text-current'
      >
        <LanguagesIcon aria-hidden='true' />
        <SelectValue />
      </SelectTrigger>
      <SelectContent position='popper' side='top' align='center'>
        {localeOptions.map(({ code, tag, endonym }) => (
          <SelectItem key={code} value={code} lang={tag}>
            {endonym}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
