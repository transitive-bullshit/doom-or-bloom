'use client'

import type { ReactNode } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CollapsibleTrigger } from '@/components/ui/collapsible'

/** Keep labels on the content baseline, with the padded hit area in the gutter. */
export function DisclosureTrigger({ children }: { children: ReactNode }) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        variant='ghost'
        className='group -mx-3 h-auto min-h-9 w-[calc(100%+1.5rem)] justify-between px-3 text-left whitespace-normal'
      >
        <span>{children}</span>
        <ChevronDownIcon className='group-data-[state=open]:rotate-180' />
      </Button>
    </CollapsibleTrigger>
  )
}
