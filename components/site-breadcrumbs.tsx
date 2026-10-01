'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { BreadcrumbTrail } from '@/components/breadcrumb-trail'
import { blogPostPath, breadcrumbTrail } from '@/lib/breadcrumbs'

export function SiteBreadcrumbs() {
  const t = useTranslations('Breadcrumbs')
  // The route path without a locale prefix; links add the current prefix back.
  const pathname = usePathname()
  // A blog post renders its own trail, ending in its title.
  if (blogPostPath.test(pathname)) return null
  const trail = breadcrumbTrail(pathname, t)
  return trail && <BreadcrumbTrail trail={trail} ariaLabel={t('label')} />
}
