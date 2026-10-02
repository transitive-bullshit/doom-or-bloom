import type { Translator } from '@/i18n/translator'

type Crumb = { href: string; label: string }
export type Trail = { crumbs: Crumb[]; label: string }

const pageLabels = {
  '/users': 'users',
  '/about': 'about',
  '/privacy': 'privacy',
  '/p-doom': 'pdoom',
  '/blog': 'blog',
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

/** A blog post's trail: its title is known only to the page that renders it. */
export const blogPostPath = /^\/blog\/[^/]+$/

/**
 * The breadcrumb trail for a route path without its locale prefix: the linked
 * ancestors and the current page's label. The site header renders it, and
 * pages describe the same trail as a BreadcrumbList in structured data. Home,
 * public assessments, share links and admin have none. A blog post passes its title.
 */
export function breadcrumbTrail(
  pathname: string,
  t: Translator<'Breadcrumbs'>,
  title?: string
): Trail | null {
  if (
    pathname === '/' ||
    pathname.startsWith('/public/assessments/') ||
    // Share links are landing pages, like public assessments.
    pathname.startsWith('/s/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  )
    return null
  const crumbs: Crumb[] = [{ href: '/', label: t('home') }]
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
  } else if (blogPostPath.test(pathname)) {
    crumbs.push({ href: '/blog', label: t('blog') })
    label = title
  } else if (pathname.startsWith('/prototypes/landing/personas/')) {
    crumbs.push({ href: '/prototypes/landing', label: 'Landing preview' })
    label = `@${pathname.split('/')[4]}`
  }
  // Unknown routes (including not-found pages) must not expose IDs as labels.
  return { crumbs, label: label ?? t('page') }
}
