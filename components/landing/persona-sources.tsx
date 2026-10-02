import { useTranslations } from 'next-intl'
import { ResourceList } from '@/components/assessment/resource-list'

export function PersonaSources({
  sources,
  sourceBriefUpdated = false
}: {
  sources: Array<{ title: string; url: string; summary?: string }>
  sourceBriefUpdated?: boolean
}) {
  const t = useTranslations('Persona')
  if (!sources.length) return null
  const uniqueSources = [
    ...new Map(sources.map((source) => [source.url, source])).values()
  ]
  return (
    <section
      id='sources'
      aria-label={t('sourcesTitle')}
      className='mt-16 flex flex-col gap-4'
    >
      <div>
        <h2>{t('sourcesTitle')}</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          {sourceBriefUpdated ? t('sourcesUpdated') : t('sourcesDefault')}
        </p>
      </div>
      <ResourceList resources={uniqueSources} />
    </section>
  )
}
