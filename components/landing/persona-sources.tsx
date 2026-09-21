import { ResourceList } from '@/components/assessment/resource-list'

export function PersonaSources({
  sources,
  sourceBriefUpdated = false
}: {
  sources: Array<{ title: string; url: string }>
  sourceBriefUpdated?: boolean
}) {
  if (!sources.length) return null
  const uniqueSources = [
    ...new Map(sources.map((source) => [source.url, source])).values()
  ]
  return (
    <section
      id='sources'
      aria-label='Sources'
      className='mt-10 flex flex-col gap-4'
    >
      <div>
        <h2 className='text-xl font-semibold tracking-tight'>Sources</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          {sourceBriefUpdated
            ? 'Sources for this persona’s current brief. The displayed simulation was generated from an earlier version; these updates will inform its next run.'
            : 'Articles, interviews, and writings used to ground this simulated persona.'}
        </p>
      </div>
      <ResourceList resources={uniqueSources} />
    </section>
  )
}
