'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
// Keeps the visitor's locale prefix when opening the new assessment URL.
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { startAssessment } from '@/lib/assessments/client'
import {
  compareParam,
  writeCompareTarget,
  type CompareTarget
} from '@/lib/sharing/compare'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'

export function AssessmentStart({
  automatic = false,
  compare
}: {
  automatic?: boolean
  /** Someone to compare the new assessment's result with. */
  compare?: CompareTarget | null
}) {
  const router = useRouter()
  const t = useTranslations('Library')
  const [busy, setBusy] = useState(automatic)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  // Read when a draft arrives; a changed prop never restarts the request.
  const compareTarget = useRef(compare)
  useEffect(() => {
    compareTarget.current = compare
  })
  useEffect(() => {
    if (!automatic && attempt === 0) return
    let active = true
    const toastId = toast.loading(t('opening'))
    void startAssessment(automatic)
      .then(({ id }) => {
        if (active) {
          toast.dismiss(toastId)
          // The compare target belongs to the new draft, in this browser only.
          const target = compareTarget.current
          if (id && target) writeCompareTarget(id, target)
          const href = id
            ? `/assessments/${id}`
            : target
              ? {
                  pathname: '/assessments',
                  query: { compare: compareParam(target) }
                }
              : '/assessments'
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
