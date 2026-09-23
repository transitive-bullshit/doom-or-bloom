import 'server-only'
import { render } from 'takumi-js'
import { loadExamples } from '@/components/landing/data'
import { LimitError } from '@/lib/server/limits'
import { ShareCard, type CardData } from './card'
import { loadSocialPortrait } from './portraits'

/** One composition and portrait-loading path for downloads and public previews. */
export async function renderShareCard(
  data: CardData,
  options: { format: 'png' | 'webp'; title?: string; simulated?: boolean }
) {
  const people = data.closestPersonaIds.length ? await loadExamples() : []
  const selected = data.closestPersonaIds.map((id) => {
    const person = people.find((person) => person.id === id)
    if (!person)
      throw Object.assign(new LimitError('Unknown persona'), { status: 400 })
    return person
  })
  const matches = await Promise.all(
    selected.map(async ({ id, name, avatar }) => ({
      id,
      name,
      portrait: await loadSocialPortrait(avatar)
    }))
  )
  const date = data.generatedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(new Date(data.generatedAt))
    : undefined
  const encoding =
    options.format === 'png'
      ? { format: 'png' as const, devicePixelRatio: 2 }
      : { format: 'webp' as const, devicePixelRatio: 1, quality: 90 }
  return render(
    <div style={{ width: 1200, height: 630, display: 'flex' }}>
      {ShareCard({
        data,
        matches,
        date,
        title: options.title,
        simulated: options.simulated
      })}
    </div>,
    {
      ...encoding,
      emoji: 'from-font',
      signal: AbortSignal.timeout(10_000)
    }
  )
}
