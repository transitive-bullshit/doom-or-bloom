'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  ListChecks,
  Users,
  RefreshCw,
  Database
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'

const navigation = [
  { href: '/admin', title: 'Overview', icon: LayoutDashboard },
  { href: '/admin/assessments', title: 'Assessments', icon: ListChecks },
  { href: '/admin/users', title: 'Users', icon: Users }
]
function AdminNavigation({ target }: { target: string }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const { setOpenMobile } = useSidebar()
  const filters = new URLSearchParams(search)
  filters.delete('page')
  filters.delete('snapshot')
  return (
    <Sidebar
      style={{ position: 'sticky', top: '1rem', height: 'calc(100svh - 8rem)' }}
    >
      <SidebarHeader className='p-4'>
        <div className='flex items-center gap-2 font-semibold'>
          <Database className='size-4' /> Local admin
        </div>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant={target === 'production' ? 'destructive' : 'secondary'}
          >
            {target === 'production' ? 'Production data' : 'Local data'}
          </Badge>
          <Badge variant='outline'>Read only</Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inspect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ href, title, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      href === '/admin'
                        ? pathname === href
                        : pathname.startsWith(href)
                    }
                  >
                    <Link
                      href={`${href}?${filters}`}
                      prefetch={false}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
export function AdminShell({
  children,
  target
}: {
  children: ReactNode
  target: string
}) {
  const router = useRouter()
  return (
    <SidebarProvider
      className='mx-auto min-h-[70svh] max-w-[1500px] items-start px-3 [&_[data-slot=sidebar-gap]]:hidden'
      style={{ '--sidebar-width': '13rem' } as React.CSSProperties}
    >
      <AdminNavigation target={target} />
      <div className='flex min-w-0 flex-1 flex-col gap-6 px-3 py-4 md:px-8'>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='md:hidden' />
            <span className='text-sm text-muted-foreground'>
              Assessment oversight
            </span>
            <Badge
              variant={target === 'production' ? 'destructive' : 'secondary'}
              className='md:hidden'
            >
              {target === 'production' ? 'Production' : 'Local'}
            </Badge>
          </div>
          <Button variant='outline' size='sm' onClick={() => router.refresh()}>
            <RefreshCw data-icon='inline-start' />
            Refresh
          </Button>
        </div>
        <div className='flex flex-col gap-6'>{children}</div>
      </div>
    </SidebarProvider>
  )
}
