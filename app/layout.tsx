import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Doom or Bloom',
  description: 'Map your AI worldview in three questions.'
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className='flex min-h-dvh flex-col'>
            <header className='flex items-center justify-between px-6 py-5'>
              <Link href='/' className='text-sm font-semibold tracking-tight'>
                Doom or Bloom
              </Link>
              <a
                href='https://github.com/transitive-bullshit/doom-or-bloom'
                className='text-sm text-muted-foreground'
              >
                GitHub
              </a>
            </header>
            <main className='flex flex-1 flex-col'>{children}</main>
            <footer className='flex flex-wrap justify-center gap-5 px-6 py-6 text-xs text-muted-foreground'>
              <Link href='/about'>About & methodology</Link>
              <Link href='/privacy'>Privacy</Link>
              <span>Experimental · 0.1.0</span>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
