import 'server-only'
import { render } from 'takumi-js'
import { languageTag, type Locale } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import { loadPersonaComparisons } from '@/components/landing/data'
import { LimitError } from '@/lib/server/limits'
import { ShareCard, type CardData } from './card'
import { cardRenderOptions, cardTranslator, wrappable } from './card-renderer'
import { loadSocialPortrait } from './portraits'

/**
 * One composition and portrait-loading path for downloads and public previews.
 * Always PNG: X's post composer does not render WebP link cards. Text uses
 * the translator's language, with Noto fallbacks for non-Latin scripts.
 */
export async function renderShareCard(
  t: Translator,
  data: CardData,
  options: {
    devicePixelRatio: 1 | 2
    locale: Locale
    title?: string
    simulated?: boolean
  }
) {
  const people = data.closestPersonaIds.length
    ? await loadPersonaComparisons()
    : []
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
    ? new Intl.DateTimeFormat(languageTag(options.locale), {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(new Date(data.generatedAt))
    : undefined
  return render(
    <div style={{ width: 1200, height: 630, display: 'flex' }}>
      {ShareCard({
        t: cardTranslator(t, options.locale),
        data,
        matches,
        date,
        title: options.title && wrappable(options.title, options.locale),
        simulated: options.simulated
      })}
    </div>,
    {
      ...(await cardRenderOptions(options.locale)),
      format: 'png',
      devicePixelRatio: options.devicePixelRatio,
      emoji: 'from-font',
      signal: AbortSignal.timeout(10_000)
    }
  )
}
