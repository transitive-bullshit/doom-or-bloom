import { ResourceBookmark } from '@/components/assessment/resource-bookmark'

export function PersonaSources({
  sources
}: {
  sources: Array<{ title: string; url: string }>
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
          Articles, interviews, and writings used to ground this simulated
          persona.
        </p>
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        {uniqueSources.map((source) => (
          <ResourceBookmark key={source.url} resource={source} />
        ))}
      </div>
    </section>
  )
}
