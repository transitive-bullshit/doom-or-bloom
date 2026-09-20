import type { Component } from '@/lib/assessment/schema'
import { facets } from '@/lib/assessment/facets'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function WorldviewDetails({ components }: { components: Component[] }) {
  const impacts = components.filter(
    (component) =>
      ['beneficial_potential', 'risk_landscape'].includes(component.vector) &&
      component.value !== null
  )
  const positions = facets
    .filter(
      (facet) => !['overall_outlook', 'outlook_orientation'].includes(facet.id)
    )
    .flatMap((facet) => {
      const component = components.find((item) => item.vector === facet.id)
      return component?.claim &&
        component.value !== null &&
        (component.confidence ?? 0) >= 0.75
        ? [{ facet, component }]
        : []
    })
  if (!impacts.length && !positions.length) return null
  return (
    <section
      aria-label='More of your worldview'
      className='flex flex-col gap-4'
    >
      <h2 className='font-semibold'>More of your worldview</h2>
      {impacts.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {impacts.map((component) => (
            <Card key={component.vector}>
              <CardHeader>
                <CardTitle>{component.label}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                <p className='text-sm text-muted-foreground'>
                  {component.claim ??
                    'Several interpretations remain plausible.'}
                </p>
                <div
                  aria-hidden='true'
                  className='relative h-2 rounded-full bg-muted'
                >
                  <div
                    className='absolute h-full rounded-full bg-primary/25'
                    style={{
                      left: `${component.range[0] * 100}%`,
                      width: `${(component.range[1] - component.range[0]) * 100}%`
                    }}
                  />
                  <div
                    className='absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary'
                    style={{ left: `${component.value! * 100}%` }}
                  />
                </div>
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>Little impact</span>
                  <span>Transformative impact</span>
                </div>
                <p className='sr-only'>
                  Interpretation range {Math.round(component.range[0] * 100)} to{' '}
                  {Math.round(component.range[1] * 100)} on the qualitative
                  scale.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {positions.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {positions.map(({ facet, component }) => (
            <Card key={facet.id}>
              <CardHeader>
                <CardTitle>{facet.label}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                {facet.levels.map((level) => (
                  <p
                    key={level}
                    className={`rounded-md px-3 py-2 text-sm ${component.claim === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    {component.claim === level && (
                      <span className='sr-only'>Your expressed position: </span>
                    )}
                    {level}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {components.some((c) => c.reasoningEvidence) && (
        <div className='flex flex-col gap-3'>
          <h3 className='font-medium'>Reasoning judgments to inspect</h3>
          {components
            .filter((c) => c.reasoningEvidence)
            .map((c) => (
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
      )}
      <p className='text-xs text-muted-foreground'>
        These interpretations keep your stated conditions. Benefits and harms
        can both be substantial. The ranges describe how we read your answers,
        not statistical confidence intervals.
      </p>
    </section>
  )
}
