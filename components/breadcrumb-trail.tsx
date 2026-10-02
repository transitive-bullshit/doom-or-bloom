import { Fragment } from 'react'
import { Link } from '@/i18n/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import type { Trail } from '@/lib/breadcrumbs'

/** Shared breadcrumbs: the first page-content element, before the h1. */
export function BreadcrumbTrail({
  trail: { crumbs, label },
  ariaLabel
}: {
  trail: Trail
  ariaLabel: string
}) {
  return (
    <Breadcrumb className='content-column' aria-label={ariaLabel}>
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
