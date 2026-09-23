import { cn } from 'cn'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { WorldviewCta } from '@/components/worldview-cta'

export function WorldviewCtaCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'mx-auto w-full max-w-[var(--content-width)] items-center gap-6 px-6 text-center',
        className
      )}
    >
      <CardTitle className='text-2xl'>Where do you land?</CardTitle>
      <CardDescription>
        Explore your own AI worldview by answering a few simple questions.
      </CardDescription>
      <WorldviewCta />
    </Card>
  )
}
