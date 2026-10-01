import type { CatalogCode } from '@/i18n/config'

// The subset Noto fonts (SIL OFL, lib/sharing/fonts/OFL-noto.txt) that share
// cards and social images register for scripts Takumi's built-in font lacks.
// Built by `pnpm fonts:subset`; lib/sharing/card-fonts.test.ts checks their
// coverage against the committed catalogs.

// SVG labels take one font per run, so each subset also carries the spaces,
// digits and punctuation that sit between its script's words.
const shared = ['U+0020-007E', 'U+00A0', 'U+00B7', 'U+2010-2027', 'U+2212']

export const cardFonts = [
  {
    family: 'NotoSansDevanagari',
    name: 'Noto Sans Devanagari',
    locales: ['hi'],
    script: /\p{Script=Devanagari}/u,
    unicodes: [
      ...shared,
      'U+0900-097F',
      'U+A8E0-A8FF',
      'U+200C-200D',
      'U+25CC'
    ],
    faces: [
      { weight: 400, file: 'NotoSansDevanagari-Regular.woff2' },
      { weight: 700, file: 'NotoSansDevanagari-Bold.woff2' }
    ]
  },
  {
    family: 'NotoSansThai',
    name: 'Noto Sans Thai',
    locales: ['th'],
    script: /\p{Script=Thai}/u,
    unicodes: [...shared, 'U+0E00-0E7F', 'U+25CC'],
    faces: [
      { weight: 400, file: 'NotoSansThai-Regular.woff2' },
      { weight: 700, file: 'NotoSansThai-Bold.woff2' }
    ]
  },
  {
    family: 'NotoSansJP',
    name: 'Noto Sans JP',
    locales: ['ja'],
    script: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}　-〿＀-￯]/u,
    unicodes: [...shared, 'U+3000-30FF', 'U+FF00-FFEF'],
    faces: [
      { weight: 400, file: 'NotoSansJP-Regular.woff2' },
      { weight: 700, file: 'NotoSansJP-Bold.woff2' }
    ]
  },
  {
    family: 'NotoSansSC',
    name: 'Noto Sans SC',
    locales: ['zh'],
    script: /[\p{Script=Han}　-〿＀-￯]/u,
    unicodes: [...shared, 'U+3000-303F', 'U+FF00-FFEF'],
    faces: [
      { weight: 400, file: 'NotoSansSC-Regular.woff2' },
      { weight: 700, file: 'NotoSansSC-Bold.woff2' }
    ]
  }
] as const satisfies readonly {
  family: string
  name: string
  locales: readonly CatalogCode[]
  script: RegExp
  unicodes: readonly string[]
  faces: readonly { weight: number; file: string }[]
}[]

/**
 * The registered fonts in the order a locale's cards try them, or none for
 * locales whose script Takumi's built-in font covers. A locale's own font
 * comes first, so Japanese and Chinese get their own Han forms, then the
 * rest.
 */
export function cardFontFamilies(locale: CatalogCode): string[] {
  const own = (font: (typeof cardFonts)[number]) =>
    (font.locales as readonly string[]).includes(locale)
  if (!cardFonts.some(own)) return []
  return [
    ...cardFonts.filter(own),
    ...cardFonts.filter((font) => !own(font))
  ].map((font) => font.name)
}
