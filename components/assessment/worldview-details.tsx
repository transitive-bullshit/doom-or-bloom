import { resultFraming, type ResultSubject } from '@/lib/sharing/result-subject'
import { AxisRange } from './axis-range'
import type { Component } from '@/lib/assessment/schema'
import { facets } from '@/lib/assessment/facets'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function WorldviewDetails({
  components,
  reasoning,
  influence,
  transformationClaim,
  subject
}: {
  components: Component[]
  reasoning: Component
  influence: Component
  transformationClaim?: string | null
  subject?: ResultSubject
}) {
  const framing = resultFraming(subject)
  const impacts = [
    ...components.filter(
      (component) =>
        ['beneficial_potential', 'risk_landscape'].includes(component.vector) &&
        component.value !== null
    ),
    { ...reasoning, label: 'Demonstrated reasoning' },
    { ...influence, label: 'Human influence' }
  ]
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
      aria-label={framing.detailsTitle}
      className='mt-5 flex flex-col gap-4'
    >
      <h2 className='text-lg font-semibold'>{framing.detailsTitle}</h2>
      {impacts.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {impacts.map((component) => (
            <Card
              key={component.vector}
              className='row-span-5 grid grid-rows-subgrid gap-3'
            >
              <CardHeader className='block'>
                <CardTitle className='text-base'>{component.label}</CardTitle>
              </CardHeader>
              <CardContent className='row-span-4 grid grid-rows-subgrid gap-3'>
                <p className='text-sm text-body-foreground'>
                  {component.vector === 'epistemic'
                    ? subject
                      ? `Reasoning, consideration of alternatives, and handling of uncertainty in ${framing.answers}. This describes the simulated answers, not the real person’s intelligence or opinions.`
                      : 'How you explain your view, consider alternatives, and handle uncertainty. This describes your answers, not your intelligence or opinions.'
                    : (component.claim ??
                      'Several interpretations remain plausible.')}
                </p>
                <p className='text-sm font-medium tabular-nums'>
                  {component.value === null
                    ? 'Not enough evidence yet'
                    : `${Math.round(component.value * 100)} / 100`}
                </p>
                <AxisRange range={component.range} value={component.value} />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>
                    {component.vector === 'epistemic'
                      ? 'Little demonstrated'
                      : component.vector === 'influence'
                        ? 'Little influence'
                        : 'Little impact'}
                  </span>
                  <span>
                    {component.vector === 'epistemic'
                      ? 'Well developed'
                      : component.vector === 'influence'
                        ? 'Strong influence'
                        : 'Transformative impact'}
                  </span>
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
      {(positions.length > 0 || (!subject && transformationClaim)) && (
        <div className='grid gap-3 sm:grid-cols-2'>
          {!subject && transformationClaim && (
            <Card className='row-span-2 grid grid-rows-subgrid'>
              <CardHeader className='block'>
                <CardTitle className='text-base'>
                  Expected transformation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-body-foreground'>
                  {transformationClaim}
                </p>
              </CardContent>
            </Card>
          )}
          {positions.map(({ facet, component }) => (
            <Card key={facet.id} className='row-span-2 grid grid-rows-subgrid'>
              <CardHeader className='block'>
                <CardTitle className='text-base'>{facet.label}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                {facet.levels.map((level) => (
                  <p
                    key={level}
                    className={`rounded-md px-3 py-2 text-sm ${component.claim === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-body-foreground'}`}
                  >
                    {component.claim === level && (
                      <span className='sr-only'>
                        {subject
                          ? 'Simulated position: '
                          : 'Your expressed position: '}
                      </span>
                    )}
                    {level}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className='text-xs text-muted-foreground'>
        These interpretations keep {framing.possessive} stated conditions.
        Benefits and harms can both be substantial. The ranges describe how we
        read {framing.answers}, not statistical confidence intervals.
      </p>
    </section>
  )
}
