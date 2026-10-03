// Builds the Noto subsets that share cards and social images use for
// Devanagari, Thai and Chinese and Japanese characters (Takumi never reads
// system fonts). Each covers its script's Unicode block, or for Han every
// character the committed catalogs and authored translations of its
// locales use, plus the dates cards print. Regular (400) and Bold (700)
// static instances are written as WOFF2 under lib/sharing/fonts/, with
// coverage.json listing the characters each covers; a unit test fails when
// a catalog gains a character its font lacks, so rerun this then.
//
//   pnpm fonts:subset --source=<directory with the Google Fonts Noto variable fonts>
//
// Needs Python fontTools and brotli, run through uv (`uv run --with
// fonttools --with brotli`); set UV_OFFLINE=1 to use uv's cache only.
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { languageTag, type CatalogCode } from '../i18n/config'
import { cardFonts } from '../lib/sharing/card-fonts'

const { values } = parseArgs({
  options: { source: { type: 'string', default: '/Library/Fonts' } }
})
const root = process.cwd()
const work = mkdtempSync(path.join(tmpdir(), 'card-fonts-'))
const fonttools = (...args: string[]) =>
  execFileSync(
    'uv',
    ['run', '--with', 'fonttools', '--with', 'brotli', 'fonttools', ...args],
    { stdio: ['ignore', 'pipe', 'inherit'] }
  ).toString()

/** Every character a locale's catalog and authored translations contain. */
function catalogText(locale: CatalogCode) {
  let text = readFileSync(path.join(root, `messages/${locale}.json`), 'utf8')
  for (const kind of ['releases', 'rubrics']) {
    const directory = path.join(root, 'content/l10n', locale, kind)
    for (const file of readdirSync(directory))
      text += readFileSync(path.join(directory, file), 'utf8')
  }
  // Translated blog posts' titles, which their cards show.
  const blog = path.join(root, 'content/l10n', locale, 'blog')
  if (existsSync(blog))
    for (const file of readdirSync(blog).filter((name) =>
      name.endsWith('.mdx')
    ))
      text += readFileSync(path.join(blog, file), 'utf8').match(
        /^title: (.*)$/mu
      )?.[1]
  // Card dates, and the Chinese numerals of a typed P(doom) like 百分之三十.
  for (let month = 0; month < 12; month++)
    text += new Intl.DateTimeFormat(languageTag(locale), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(Date.UTC(2026, month, 28)))
  return `${text}百分之零〇一二两三四五六七八九十点`
}

const sources: Record<string, string> = {
  NotoSansDevanagari: 'NotoSansDevanagari[wdth,wght].ttf',
  NotoSansThai: 'NotoSansThai[wdth,wght].ttf',
  NotoSansJP: 'NotoSansJP[wght].ttf',
  NotoSansSC: 'NotoSansSC[wght].ttf'
}
const coverage: Record<string, string> = {}
for (const font of cardFonts) {
  const source = path.join(values.source!, sources[font.family]!)
  const characters = new Set(
    font.locales
      .flatMap((locale) => Array.from(catalogText(locale)))
      .filter((char) => font.script.test(char))
  )
  const textFile = path.join(work, `${font.family}.txt`)
  writeFileSync(textFile, [...characters].join(''))
  const subset = path.join(work, `${font.family}-subset.ttf`)
  // Keep every layout feature: Devanagari conjuncts, Thai mark placement and
  // the Japanese and Chinese locl forms depend on them.
  fonttools(
    'subset',
    source,
    `--text-file=${textFile}`,
    `--unicodes=${font.unicodes.join(',')}`,
    '--layout-features=*',
    '--name-IDs=*',
    '--notdef-outline',
    '--no-hinting',
    `--output-file=${subset}`
  )
  for (const face of font.faces) {
    const instance = path.join(work, `${face.file}.ttf`)
    fonttools(
      'varLib.instancer',
      subset,
      `wght=${face.weight}`,
      ...(font.family === 'NotoSansJP' || font.family === 'NotoSansSC'
        ? []
        : ['wdth=100']),
      '--static',
      '-o',
      instance
    )
    fonttools(
      'ttLib.woff2',
      'compress',
      instance,
      '-o',
      path.join(root, 'lib/sharing/fonts', face.file)
    )
  }
  coverage[font.family] = fonttools(
    'ttx',
    '-q',
    '-t',
    'cmap',
    '-o',
    '-',
    subset
  )
    .match(/code="0x[0-9a-f]+"/gu)!
    .map((match) => String.fromCodePoint(Number(match.slice(6, -1))))
    .filter((char, index, all) => all.indexOf(char) === index)
    .toSorted()
    .join('')
}
writeFileSync(
  path.join(root, 'lib/sharing/fonts/coverage.json'),
  `${JSON.stringify(coverage, null, 2)}\n`
)
console.log(
  cardFonts
    .flatMap((font) => font.faces.map((face) => face.file))
    .map((file) => {
      const size = readFileSync(
        path.join(root, 'lib/sharing/fonts', file)
      ).length
      return `${file}: ${(size / 1024).toFixed(0)} KB`
    })
    .join('\n')
)
