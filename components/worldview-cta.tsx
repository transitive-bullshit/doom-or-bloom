import { useLocale, useTranslations } from 'next-intl'
import { getPathname } from '@/i18n/navigation'
import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

export function WorldviewCta({
  label,
  size = 'default'
}: {
  size?: 'default' | 'sm'
  label?: string
}) {
  const t = useTranslations('Cta')
  const locale = useLocale()
  return (
    <ExpandingArrowLink
      href={getPathname({ href: '/assessments?start=1', locale })}
      size={size}
    >
      {label ?? t('mapWorldview')}
    </ExpandingArrowLink>
  )
}
