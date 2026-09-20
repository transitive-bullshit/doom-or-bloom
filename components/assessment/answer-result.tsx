'use client'

import { useState } from 'react'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import { Map } from './worldview-map'
import { WorldviewDetails } from './worldview-details'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

export function AnswerResult({
  operation
}: {
  operation?: SavedDebugOperation
}) {
  const [open, setOpen] = useState(false)
  const [traceOpen, setTraceOpen] = useState(false)
  const snapshot = operation?.assessment
  const result = snapshot?.result
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='rounded-lg border p-3'
    >
      <CollapsibleTrigger asChild>
        <Button variant='ghost' size='sm'>
          Results after this answer
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-4 flex flex-col gap-4'>
        {result && result.evidenceRevision === snapshot?.evidenceRevision ? (
          <>
            <Map
              horizontal={result.horizontal}
              vertical={result.vertical}
              layout='contained'
            />
            <WorldviewDetails components={result.components} />
          </>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No result snapshot was recorded for this answer. Older runs cannot
            reconstruct the original result from the final state.
          </p>
        )}
        {open && operation && (
          <Collapsible open={traceOpen} onOpenChange={setTraceOpen}>
            <CollapsibleTrigger asChild>
              <Button variant='outline' size='sm'>
                Underlying state & Jev trace
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className='mt-3 whitespace-pre-wrap wrap-anywhere text-xs'>
                {traceOpen ? JSON.stringify(operation, null, 2) : null}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
