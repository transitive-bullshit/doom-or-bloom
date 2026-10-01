import { useTranslations } from 'next-intl'
import type { Component } from '@/lib/assessment/schema'
import { componentLabel } from '@/lib/assessment/display-text'

export function ReasoningJudgments({
  components
}: {
  components: Component[]
}) {
  const root = useTranslations()
  const t = useTranslations('Results')
  const judgments = components.filter(
    (component) => component.reasoningEvidence
  )
  if (judgments.length === 0) return null

  return (
    <div className='flex flex-col gap-3'>
      {judgments.map((c) => (
        <details key={c.vector} className='rounded-lg border p-3 text-sm'>
          <summary className='cursor-pointer'>
            {t(
              c.reasoningEvidence!.status === 'unsubstantiated'
                ? 'reasoningNeedsReview'
                : 'reasoningScore',
              {
                label: componentLabel(root, c),
                score: Math.round(c.value! * 100)
              }
            )}
          </summary>
          <p className='mt-3'>
            {c.reasoningEvidence!.status === 'supported'
              ? c.reasoningEvidence!.weakness
              : t('unlinked')}
          </p>
          {c.reasoningEvidence!.excerpt && (
            <blockquote className='mt-3 border-l-2 pl-3 whitespace-pre-wrap'>
              {c.reasoningEvidence!.excerpt}
            </blockquote>
          )}
        </details>
      ))}
    </div>
  )
}
