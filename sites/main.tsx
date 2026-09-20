import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteActions } from '@/components/site-actions'
import { Interview } from '@/components/assessment/interview'
import { JourneysInspector } from '@/components/debug/journeys'
import About from '@/app/about/page'
import Privacy from '@/app/privacy/page'
import type { ComponentProps } from 'react'

const response = await fetch('/site-props.json')
if (!response.ok) throw new Error('The site could not load its content')
const props = (await response.json()) as {
  interview: ComponentProps<typeof Interview>
  journeys: ComponentProps<typeof JourneysInspector>
}
import '@/app/globals.css'

const pathname = window.location.pathname
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <div className='flex min-h-dvh flex-col'>
      <header className='flex items-center justify-between px-6 py-5'>
        <a href='/' className='text-sm font-semibold tracking-tight'>
          Doom or Bloom
        </a>
        <SiteActions />
      </header>
      <main className='flex flex-1 flex-col'>
        {pathname === '/user-journeys' ? (
          <JourneysInspector {...props.journeys} />
        ) : pathname === '/about' ? (
          <About />
        ) : pathname === '/privacy' ? (
          <Privacy />
        ) : pathname === '/' ? (
          <Interview {...props.interview} />
        ) : (
          <p className='p-8'>
            Page not found. <a href='/'>Return to assessment</a>
          </p>
        )}
      </main>
      <footer className='flex flex-wrap justify-center gap-5 px-6 py-6 text-xs text-muted-foreground'>
        <a href='/about'>About &amp; methodology</a>
        <a href='/privacy'>Privacy</a>
        <a href='/user-journeys'>User journeys</a>
        <span>Experimental · 0.1.0</span>
      </footer>
    </div>
  </ThemeProvider>
)
