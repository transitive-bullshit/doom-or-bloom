'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'
import { startAssessment } from '@/lib/assessments/client'
import { toast } from 'sonner'

export function WorldviewCta({
  onlyIfEmpty = true,
  label = 'Map your own worldview'
}: {
  onlyIfEmpty?: boolean
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  return (
    <ExpandingArrowAction
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          const { id } = await startAssessment(onlyIfEmpty)
          router.push(id ? `/assessments/${id}` : '/assessments')
        } catch (err) {
          toast.error(
            err instanceof Error
              ? err.message
              : 'Unable to start. Please try again.'
          )
        } finally {
          setBusy(false)
        }
      }}
    >
      {busy ? 'Opening your assessment…' : label}
    </ExpandingArrowAction>
  )
}
