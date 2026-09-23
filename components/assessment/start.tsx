'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { startAssessment } from '@/lib/assessments/client'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'

export function AssessmentStart({
  automatic = false
}: {
  automatic?: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(automatic)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!automatic && attempt === 0) return
    let active = true
    void startAssessment(automatic)
      .then(({ id }) => {
        if (active) {
          const href = id ? `/assessments/${id}` : '/assessments'
          if (automatic) router.replace(href)
          else router.push(href)
        }
      })
      .catch(() => {
        if (active) {
          setError('We couldn’t open your assessment. Please try again.')
          setBusy(false)
        }
      })
    return () => {
      active = false
    }
  }, [automatic, attempt, router])
  return (
    <div className='flex flex-col items-start gap-3'>
      {busy && <p role='status'>Opening your assessment…</p>}
      {error && <p role='alert'>{error}</p>}
      {!automatic || error ? (
        <ExpandingArrowAction
          disabled={busy}
          onClick={() => {
            setError('')
            setBusy(true)
            setAttempt((value) => value + 1)
          }}
        >
          {error ? 'Try again' : 'Create a new assessment'}
        </ExpandingArrowAction>
      ) : null}
    </div>
  )
}
