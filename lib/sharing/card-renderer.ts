import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Renderer } from 'takumi-js/node'
import { languageTag, type CatalogCode } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import { cardFontFamilies, cardFonts } from './card-fonts'

let renderer: Promise<Renderer> | undefined

// Takumi never reads system fonts. Its built-in font covers Latin text; the
// committed Noto subsets cover Devanagari, Thai, Japanese and Chinese. Inter
// Tight, the site social image's typeface, serves cards that name it.
function cardRenderer() {
  return (renderer ??= (async () => {
    const instance = new Renderer()
    await instance.registerFont({
      name: 'Inter Tight',
      data: await readFile(
        path.join(process.cwd(), 'lib/sharing/fonts/InterTight.woff2')
      )
    })
    for (const font of cardFonts)
      for (const face of font.faces)
        await instance.registerFont({
          name: font.name,
          weight: face.weight,
          data: await readFile(
            path.join(process.cwd(), 'lib/sharing/fonts', face.file)
          )
        })
    return instance
  })().catch((err: unknown) => {
    renderer = undefined
    throw err
  }))
}

/**
 * Takumi options for a card in a locale. Latin-script locales keep the
 * default renderer, so their cards are unchanged. Hindi, Thai, Chinese and
 * Japanese get the font-registered renderer, their language (it picks Han
 * forms) and their own Noto family first: SVG labels take one font per run,
 * so its spaces, digits and Latin letters come from it too.
 */
export async function cardRenderOptions(locale: CatalogCode) {
  const fontFamilies = cardFontFamilies(locale)
  if (!fontFamilies.length) return {}
  return {
    renderer: await cardRenderer(),
    lang: languageTag(locale),
    fontFamilies
  }
}

/**
 * Takumi options for a card set in Inter Tight, in every locale. Letters
 * Inter Tight lacks fall back to the locale's own Noto subset, then the rest.
 */
export async function interTightRenderOptions(locale: CatalogCode) {
  return {
    renderer: await cardRenderer(),
    lang: languageTag(locale),
    fontFamilies: ['Inter Tight', ...cardFontFamilies(locale)]
  }
}

/**
 * Thai writes no spaces between words, and Takumi breaks lines only at break
 * opportunities, so card text marks Thai word boundaries with zero-width
 * spaces. Other languages are unchanged.
 */
export function wrappable(text: string, locale: CatalogCode) {
  if (locale !== 'th') return text
  return Array.from(
    new Intl.Segmenter(languageTag(locale), { granularity: 'word' }).segment(
      text
    ),
    ({ segment }) => segment
  ).join('​')
}

/** A translator whose messages wrap in the card's language. */
export function cardTranslator(t: Translator, locale: CatalogCode): Translator {
  if (locale !== 'th') return t
  // Messages keep their methods (`has`, `rich`); only plain calls wrap.
  return new Proxy(t, {
    apply: (target, _self, args: Parameters<Translator>) =>
      wrappable(target(...args), locale)
  })
}
