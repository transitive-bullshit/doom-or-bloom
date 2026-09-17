'use client'
import { useTheme } from 'next-themes'
import { CodeXml, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function SiteActions() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <nav
      className='flex items-center gap-1'
      aria-label='Project links and appearance'
    >
      <Button variant='ghost' size='icon' asChild>
        <a
          href='https://github.com/transitive-bullshit/doom-or-bloom'
          aria-label='Project on GitHub'
        >
          <CodeXml />
        </a>
      </Button>
      <Button variant='ghost' size='icon' asChild>
        <a href='https://x.com/transitive_bs' aria-label='Travis on X'>
          <span className='text-base' aria-hidden='true'>
            𝕏
          </span>
        </a>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        aria-label='Toggle light or dark theme'
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className='dark:hidden' />
        <Moon className='hidden dark:block' />
      </Button>
    </nav>
  )
}
