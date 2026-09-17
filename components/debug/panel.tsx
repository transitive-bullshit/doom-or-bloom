'use client'
import type { Assessment, DebugTrace } from '@/lib/assessment/schema'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
export function DebugPanel({
  trace,
  assessment
}: {
  trace?: DebugTrace
  assessment: Assessment
}) {
  return (
    <section className='mt-8 border-t pt-6'>
      <Badge variant='outline'>Debug mode</Badge>
      <Collapsible className='mt-3'>
        <CollapsibleTrigger asChild>
          <Button variant='outline'>Jev / assessment debugging details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='mt-4'>
          <p className='mb-3 text-sm text-muted-foreground'>
            Observed inputs, typed judgments, and code decisions. These details
            may include your answers.
          </p>
          <pre className='max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap break-all'>
            {JSON.stringify(
              {
                trace: trace ?? 'No transient operation trace available',
                counters: {
                  prompts: assessment.prompts.length,
                  substantive: assessment.answers.length,
                  recovery: assessment.recovery
                },
                versions: assessment.versions,
                coverage: assessment.coverage,
                judgments: assessment.judgments
              },
              null,
              2
            )}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
