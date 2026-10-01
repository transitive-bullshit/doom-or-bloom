import { useTranslations } from 'next-intl'
import { subjectArgs, type ResultSubject } from '@/lib/sharing/result-subject'
import { AxisRange } from './axis-range'
import type { Component } from '@/lib/assessment/schema'
import { facets } from '@/lib/assessment/facets'
import {
  claimText,
  componentLabel,
  levelTextsFor
} from '@/lib/assessment/display-text'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuthoredText } from './authored-text'

export function WorldviewDetails({
  components,
  influence,
  transformationClaim,
  subject
}: {
  components: Component[]
  influence: Component
  transformationClaim?: string | null
  subject?: ResultSubject
}) {
  const root = useTranslations()
  const t = useTranslations('Results.details')
  const authored = useAuthoredText()
  const impacts = [
    ...components.filter(
      (component) =>
        ['beneficial_potential', 'risk_landscape'].includes(component.vector) &&
        component.value !== null
    ),
    { ...influence, vector: 'influence' }
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
    <section aria-label={t('title')} className='mt-5 flex flex-col gap-4'>
      <h4>{t('title')}</h4>
      {impacts.length > 0 && (
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {impacts.map((component) => (
            <Card
              key={component.vector}
              className='row-span-5 grid grid-rows-subgrid gap-3'
            >
              <CardHeader className='block'>
                <CardTitle className='text-base'>
                  {componentLabel(root, component)}
                </CardTitle>
              </CardHeader>
              <CardContent className='row-span-4 grid grid-rows-subgrid gap-3'>
                <p className='text-sm text-body-foreground'>
                  {component.claim
                    ? claimText(
                        root,
                        component.claim,
                        component.vector,
                        authored
                      )
                    : t('severalReadings')}
                </p>
                <p className='text-sm font-medium tabular-nums'>
                  {component.value === null
                    ? t('notEnough')
                    : t('score', { value: Math.round(component.value * 100) })}
                </p>
                <AxisRange range={component.range} value={component.value} />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>
                    {component.vector === 'influence'
                      ? t('littleInfluence')
                      : t('littleImpact')}
                  </span>
                  <span>
                    {component.vector === 'influence'
                      ? t('strongInfluence')
                      : t('transformativeImpact')}
                  </span>
                </div>
                <p className='sr-only'>
                  {t('range', {
                    low: Math.round(component.range[0] * 100),
                    high: Math.round(component.range[1] * 100)
                  })}
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
                  {t('expectedTransformation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-body-foreground'>
                  {claimText(
                    root,
                    transformationClaim,
                    'transformation',
                    authored
                  )}
                </p>
              </CardContent>
            </Card>
          )}
          {positions.map(({ facet, component }) => (
            <Card key={facet.id} className='row-span-2 grid grid-rows-subgrid'>
              <CardHeader className='block'>
                <CardTitle className='text-base'>
                  {componentLabel(root, {
                    vector: facet.id,
                    label: facet.label
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                {levelTextsFor(root, facet.id, facet.levels).map(
                  ({ claim, text }) => (
                    <p
                      key={claim}
                      className={`rounded-md px-3 py-2 text-sm ${component.claim === claim ? 'bg-primary text-primary-foreground' : 'bg-muted text-body-foreground'}`}
                    >
                      {component.claim === claim && (
                        <span className='sr-only'>
                          {subject ? t('simulatedPosition') : t('yourPosition')}
                        </span>
                      )}
                      {text}
                    </p>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className='text-xs text-muted-foreground'>
        {t('note', subjectArgs(subject))}
      </p>
    </section>
  )
}
