'use client'

import { Fragment } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const pageLabels = {
  '/users': 'users',
  '/about': 'about',
  '/privacy': 'privacy',
  '/assessments': 'assessments',
  '/assessment': 'newAssessment'
} as const

// Local tools are English-only and live outside app/[locale].
const toolLabels: Record<string, string> = {
  '/questions': 'Questions',
  '/corpus': 'Corpus',
  '/user-journeys': 'User Journeys',
  '/prototypes/landing': 'Landing preview',
  '/prototypes/worldview-map': 'Worldview map preview'
}

export function SiteBreadcrumbs() {
  const t = useTranslations('Breadcrumbs')
  // The route path without a locale prefix; links add the current prefix back.
  const pathname = usePathname()
  if (
    pathname === '/' ||
    pathname.startsWith('/public/assessments/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  ) {
    return null
  }

  const crumbs = [{ href: '/', label: t('home') }]
  let label: string | undefined =
    pathname in pageLabels
      ? t(pageLabels[pathname as keyof typeof pageLabels])
      : toolLabels[pathname]
  if (pathname === '/assessment' || /^\/assessments\/[^/]+$/.test(pathname)) {
    crumbs.push({ href: '/assessments', label: t('assessments') })
    label ??= t('assessment')
  } else if (pathname.startsWith('/users/')) {
    crumbs.push({ href: '/users', label: t('users') })
    label = `@${pathname.split('/')[2]}`
  } else if (pathname.startsWith('/prototypes/landing/personas/')) {
    crumbs.push({ href: '/prototypes/landing', label: 'Landing preview' })
    label = `@${pathname.split('/')[4]}`
  }
  // Unknown routes (including not-found pages) must not expose IDs as labels.
  label ??= t('page')

  return (
    <Breadcrumb className='content-column' aria-label={t('label')}>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={crumb.href}>{crumb.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
