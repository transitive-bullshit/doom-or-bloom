import { cn } from 'cn'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { WorldviewCta } from '@/components/worldview-cta'

/** Invites a visitor to someone else's result to map their own and compare. */
export function CompareCta({
  name,
  className
}: {
  name?: string | null
  className?: string
}) {
  return (
    <Card
      className={cn(
        'gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex flex-col gap-1.5'>
        <CardTitle className='text-lg text-balance'>
          {name ? `Where do you land vs ${name}?` : 'Where do you land?'}
        </CardTitle>
        <CardDescription>
          Map your own AI worldview in about 3 minutes, then compare
        </CardDescription>
      </div>
      <div className='shrink-0'>
        <WorldviewCta label='Map my worldview' />
      </div>
    </Card>
  )
}
