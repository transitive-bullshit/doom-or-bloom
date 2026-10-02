import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/config'
import { getPathname } from '@/i18n/navigation'
import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

/** The start link; `compare` carries a compare target into the new draft. */
function startHref(locale: Locale, compare?: string) {
  return getPathname({
    href: {
      pathname: '/assessments',
      query: compare ? { start: '1', compare } : { start: '1' }
    },
    locale
  })
}

export function WorldviewCta({
  label,
  size = 'default',
  compare
}: {
  size?: 'default' | 'sm'
  label?: string
  /** `persona:<slug>` or a share link ID; see lib/sharing/compare.ts. */
  compare?: string
}) {
  const t = useTranslations('Cta')
  const locale = useLocale()
  return (
    <ExpandingArrowLink href={startHref(locale, compare)} size={size}>
      {label ?? t('mapWorldview')}
    </ExpandingArrowLink>
  )
}
