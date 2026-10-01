'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
// Keeps the visitor's locale prefix when opening the new assessment URL.
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { startAssessment } from '@/lib/assessments/client'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'

export function AssessmentStart({
  automatic = false
}: {
  automatic?: boolean
}) {
  const router = useRouter()
  const t = useTranslations('Library')
  const [busy, setBusy] = useState(automatic)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!automatic && attempt === 0) return
    let active = true
    const toastId = toast.loading(t('opening'))
    void startAssessment(automatic)
      .then(({ id }) => {
        if (active) {
          toast.dismiss(toastId)
          const href = id ? `/assessments/${id}` : '/assessments'
          if (automatic) router.replace(href)
          else router.push(href)
        }
      })
      .catch(() => {
        if (active) {
          const message = t('openFailed')
          toast.error(message, { id: toastId })
          setError(message)
          setBusy(false)
        }
      })
    return () => {
      active = false
      toast.dismiss(toastId)
    }
  }, [automatic, attempt, router, t])
  return (
    <div className='flex flex-col items-start gap-3'>
      {!automatic || error ? (
        <ExpandingArrowAction
          disabled={busy}
          onClick={() => {
            setError('')
            setBusy(true)
            setAttempt((value) => value + 1)
          }}
        >
          {error ? t('tryAgain') : t('create')}
        </ExpandingArrowAction>
      ) : null}
    </div>
  )
}
