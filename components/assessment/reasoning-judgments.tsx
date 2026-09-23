import type { Component } from '@/lib/assessment/schema'

export function ReasoningJudgments({
  components
}: {
  components: Component[]
}) {
  const judgments = components.filter(
    (component) => component.reasoningEvidence
  )
  if (judgments.length === 0) return null

  return (
    <div className='flex flex-col gap-3'>
      {judgments.map((c) => (
        <details key={c.vector} className='rounded-lg border p-3 text-sm'>
          <summary className='cursor-pointer'>
            {c.label} · {Math.round(c.value! * 100)} / 100
            {c.reasoningEvidence!.status === 'unsubstantiated'
              ? ' · needs review'
              : ''}
          </summary>
          <p className='mt-3'>
            {c.reasoningEvidence!.status === 'supported'
              ? c.reasoningEvidence!.weakness
              : 'The evaluator could not link this rubric reading to a specific supplied excerpt. Treat the score as needing review.'}
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
