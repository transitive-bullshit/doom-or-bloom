'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DisclosureTrigger } from '@/components/disclosure-trigger'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'

/**
 * Footnotes past the first few, folded away. Following a footnote marker to
 * one of them, by click or by URL hash, opens the list and scrolls to it.
 */
export function MoreSources({
  children,
  showLabel,
  hideLabel
}: {
  children: ReactNode
  showLabel: string
  hideLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const content = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reveal = (hash: string) => {
      const id = decodeURIComponent(hash.replace(/^#/, ''))
      if (id && content.current?.querySelector(`[id="${CSS.escape(id)}"]`)) {
        setOpen(true)
        setPending(id)
      }
    }
    // A repeated click on the same marker fires no hashchange, so watch clicks too.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]')
      if (link) reveal(link.getAttribute('href') ?? '')
    }
    const onHash = () => reveal(window.location.hash)
    reveal(window.location.hash)
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHash)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  useEffect(() => {
    if (!open || !pending) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(pending)?.scrollIntoView({ block: 'start' })
      setPending(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [open, pending])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {/* Mounted while closed so footnote anchors always exist. */}
      <CollapsibleContent
        forceMount
        ref={content}
        className='data-[state=closed]:hidden'
      >
        {children}
      </CollapsibleContent>
      <div className='mt-3'>
        <DisclosureTrigger>{open ? hideLabel : showLabel}</DisclosureTrigger>
      </div>
    </Collapsible>
  )
}
