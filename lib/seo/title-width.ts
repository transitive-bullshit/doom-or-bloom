// How wide a title renders in Google's desktop results: 20px Arial, cut with
// "..." past about 600px. Widths are Arial's advance widths in font units
// (2048 per em) for printable ASCII; accented letters take their base
// letter's width. Kerning is ignored, which overestimates slightly.

/** Google's desktop title limit in pixels, before the brand suffix is cut. */
export const googleTitleLimit = 600

const fontSize = 20
const unitsPerEm = 2048
// U+0020 through U+007E.
const ascii = [
  569, 569, 727, 1139, 1139, 1821, 1366, 391, 682, 682, 797, 1196, 569, 682,
  569, 569, 1139, 1139, 1139, 1139, 1139, 1139, 1139, 1139, 1139, 1139, 569,
  569, 1196, 1196, 1196, 1139, 2079, 1366, 1366, 1479, 1479, 1366, 1251, 1593,
  1479, 569, 1024, 1366, 1139, 1706, 1479, 1593, 1366, 1593, 1479, 1366, 1251,
  1479, 1366, 1933, 1366, 1366, 1251, 569, 569, 569, 961, 1139, 682, 1139, 1139,
  1024, 1139, 1139, 569, 1139, 1139, 455, 455, 1024, 455, 1706, 1139, 1139,
  1139, 1139, 682, 1024, 569, 1139, 1024, 1479, 1024, 1024, 1024, 684, 532, 684,
  1196
]
const typographic: Record<string, number> = {
  '‘': 455,
  '’': 455,
  '“': 682,
  '”': 682,
  '–': 1139,
  '—': 2048,
  '…': 2048
}
// A digit's width stands in for anything else.
const fallback = 1139

function units(char: string) {
  const code = char.codePointAt(0)!
  if (code >= 0x20 && code <= 0x7e) return ascii[code - 0x20]!
  if (char in typographic) return typographic[char]!
  const base = char.normalize('NFD')[0]!
  const baseCode = base.codePointAt(0)!
  return base !== char && baseCode >= 0x20 && baseCode <= 0x7e
    ? ascii[baseCode - 0x20]!
    : fallback
}

/** Rendered width in pixels of a title in Google's desktop results. */
export function googleTitleWidth(title: string) {
  let total = 0
  for (const char of title) total += units(char)
  return (total * fontSize) / unitsPerEm
}
