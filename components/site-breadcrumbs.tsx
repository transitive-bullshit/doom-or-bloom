'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const pageLabels: Record<string, string> = {
  '/about': 'About',
  '/privacy': 'Privacy',
  '/assessments': 'My assessments',
  '/assessment': 'New assessment',
  '/questions': 'Questions',
  '/corpus': 'Corpus',
  '/user-journeys': 'User Journeys',
  '/prototypes/landing': 'Landing preview',
  '/prototypes/worldview-map': 'Worldview map preview'
}

export function SiteBreadcrumbs() {
  const pathname = usePathname()
  if (pathname === '/' || pathname.startsWith('/public/assessments/')) {
    return null
  }

  const crumbs = [{ href: '/', label: 'Home' }]
  let label = pageLabels[pathname]
  if (pathname === '/assessment' || /^\/assessments\/[^/]+$/.test(pathname)) {
    crumbs.push({ href: '/assessments', label: 'My assessments' })
    label ??= 'Assessment'
  } else if (pathname.startsWith('/users/')) {
    label = `@${pathname.split('/')[2]}`
  } else if (pathname.startsWith('/prototypes/landing/personas/')) {
    crumbs.push({ href: '/prototypes/landing', label: 'Landing preview' })
    label = `@${pathname.split('/')[4]}`
  }
  // Unknown routes (including not-found pages) must not expose IDs as labels.
  label ??= 'Page'

  return (
    <Breadcrumb className='content-column'>
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
