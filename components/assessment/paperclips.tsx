'use client'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function Paperclips({ dismiss }: { dismiss: () => void }) {
  return (
    <div className='pointer-events-none fixed inset-0 overflow-hidden'>
      <div className='paperclip-effect' aria-hidden='true'>
        {Array.from({ length: 28 }, (_, i) => (
          <Paperclip
            key={i}
            className='absolute size-10 text-muted-foreground/25'
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 95}%`,
              transform: `rotate(${i * 17}deg)`
            }}
          />
        ))}
      </div>
      <div className='pointer-events-auto absolute right-4 bottom-4'>
        <Button variant='outline' onClick={dismiss}>
          Dismiss paperclips
        </Button>
      </div>
    </div>
  )
}
