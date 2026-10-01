// Authored event-probability bands. Jev weights interpretations of the
// participant’s belief; its category confidence is never itself a P(doom).
export const doomBands = {
  virtually_impossible: {
    bounds: [0, 0.001],
    label:
      'Catastrophe is virtually impossible: at most a one-in-a-thousand chance (0–0.1%).'
  },
  negligible: {
    bounds: [0.001, 0.01],
    label:
      'Negligible catastrophe risk, but more than virtually impossible (0.1–1%).'
  },
  remote: {
    bounds: [0.01, 0.03],
    label:
      'A remote but real catastrophe risk, around one to three chances in a hundred (1–3%).'
  },
  very_unlikely: {
    bounds: [0.03, 0.1],
    label: 'Very unlikely catastrophe, a small but nonzero chance (3–10%).'
  },
  unlikely: {
    bounds: [0.1, 0.3],
    label: 'Unlikely catastrophe, but a substantial minority chance (10–30%).'
  },
  plausible: {
    bounds: [0.3, 0.5],
    label:
      'Catastrophe is a roughly even or somewhat less likely outcome (30–50%).'
  },
  likely: {
    bounds: [0.5, 0.7],
    label: 'Catastrophe is more likely than not (50–70%).'
  },
  very_likely: {
    bounds: [0.7, 0.9],
    label: 'Catastrophe is very likely, but not almost inevitable (70–90%).'
  },
  near_certain: {
    bounds: [0.9, 0.97],
    label:
      'Catastrophe is the emphatically expected default, but a meaningful small chance of avoiding it remains (90–97%).'
  },
  almost_certain: {
    bounds: [0.97, 0.99],
    label:
      'Catastrophe is almost inevitable; avoiding it would require an exceptional escape (97–99%).'
  },
  virtually_certain: {
    bounds: [0.99, 1],
    label:
      'Catastrophe is treated as a practical certainty, with essentially no credible chance of avoiding it (99–100%).'
  }
} satisfies Record<string, { bounds: [number, number]; label: string }>

// Band edges of 0 and 1 are clamped so every band has a finite log-odds span.
const edge = 0.0002
const logit = (p: number) => {
  const q = Math.min(1 - edge, Math.max(edge, p))
  return Math.log(q / (1 - q))
}
const expit = (z: number) => 1 / (1 + Math.exp(-z))
// Simulated retakes of the same worldview moved P(doom) by roughly 0.3–0.5
// log-odds, so no displayed range is narrower than this half-width.
const minimumHalfWidth = 0.5

/**
 * Infers a P(doom) estimate from a band distribution by averaging in log-odds.
 * Averaging band midpoints on the probability scale let diffuse distributions
 * inflate low estimates, and the former sharpening correction then squashed
 * the 5–40% range. Returns null when no band carries probability mass.
 */
export function inferPdoom(distribution: Record<string, number>) {
  const bands = Object.values(doomBands).map((band, index) => ({
    low: logit(band.bounds[0]),
    high: logit(band.bounds[1]),
    bounds: band.bounds,
    mass: distribution[Object.keys(doomBands)[index]!] ?? 0
  }))
  const mass = bands.reduce((sum, band) => sum + band.mass, 0)
  if (mass <= 0) return null
  const center =
    bands.reduce(
      (sum, band) => sum + (band.mass * (band.low + band.high)) / 2,
      0
    ) / mass
  // Uniform interpolation within a band is an authored display approximation.
  const quantile = (target: number) => {
    let cumulative = 0
    for (const band of bands) {
      const weight = band.mass / mass
      if (weight > 0 && cumulative + weight >= target)
        return (
          band.low + ((target - cumulative) / weight) * (band.high - band.low)
        )
      cumulative += weight
    }
    return bands.at(-1)!.high
  }
  const padding = 2 * Math.max(0, 1 - mass)
  const rawEstimate =
    bands.reduce(
      (sum, band) => sum + (band.mass * (band.bounds[0] + band.bounds[1])) / 2,
      0
    ) / mass
  return {
    estimate: expit(center),
    bounds: [
      expit(Math.min(center - minimumHalfWidth, quantile(0.25) - padding)),
      expit(Math.max(center + minimumHalfWidth, quantile(0.75) + padding))
    ] as [number, number],
    rawEstimate,
    mass
  }
}

export function pdoomToken(estimate: number) {
  if (estimate < 0.01) return '<1%'
  if (estimate > 0.99) return '>99%'
  return `≈${Math.round(estimate * 100)}%`
}

// Stated percentages in every enabled language. Candidates match the
// participant's original text, so a token stays an exact quote; its values
// and qualifiers are read from a normalized copy (NFKC, which turns
// full-width digits and ％ into ASCII, plus Devanagari and Thai digits).

/** Each word as typed in any Unicode normalization form, for matching. */
const forms = (words: readonly string[]) => [
  ...new Set(
    words.flatMap((word) =>
      (['NFC', 'NFD', 'NFKC', 'NFKD'] as const).map((form) =>
        word.normalize(form)
      )
    )
  )
]
const alternatives = (words: readonly string[]) =>
  forms(words)
    .toSorted((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('|')

/** Word lists written one language per line, alternatives split on `|`. */
const words = (...groups: string[]) =>
  groups.flatMap((group) => group.split('|'))

// Prefix qualifiers. English keeps exactly its earlier words.
const below = words(
  'less than|under|below|at most|<',
  'menos de|menos del|como mucho|como máximo|a lo sumo|por debajo de|por debajo del|no más de|no más del',
  'no máximo|abaixo de|não mais que|não mais de',
  'weniger als|unter|höchstens|nicht mehr als',
  'moins de|au plus|au maximum|pas plus de',
  'kurang dari|di bawah|paling banyak|tidak lebih dari',
  '不到|低于|少于|小于|至多|最多|不超过',
  '多くても|せいぜい',
  'น้อยกว่า|ไม่ถึง|ต่ำกว่า|ไม่เกิน|อย่างมาก',
  'अधिक से अधिक|ज़्यादा से ज़्यादा|ज्यादा से ज्यादा'
)
const above = words(
  'more than|over|above|at least|>',
  'más de|más del|al menos|por lo menos|como mínimo|por encima de|por encima del',
  'mais de|pelo menos|no mínimo|acima de',
  'mehr als|über|mindestens',
  'plus de|au moins',
  'lebih dari|di atas|paling sedikit|setidaknya',
  '超过|高于|多于|大于|至少',
  '少なくとも|最低でも',
  'มากกว่า|เกินกว่า|สูงกว่า|อย่างน้อย',
  'कम से कम'
)
const about = words(
  'about|around|roughly|approximately|~',
  'alrededor de|alrededor del|cerca de|cerca del|aproximadamente|unos|unas|en torno al|en torno a',
  'em torno de|por volta de|uns|umas',
  'etwa|ungefähr|rund',
  'environ|à peu près|autour de|près de',
  'sekitar|kira-kira|kurang lebih',
  '大约|大概|约',
  '約|およそ|だいたい|大体',
  'ประมาณ|ราว ๆ|ราวๆ|ราว',
  'लगभग|करीब|क़रीब|तकरीबन|तक़रीबन'
)
// Suffix qualifiers, as Japanese, Chinese, Thai and Hindi place them.
const belowAfter = words('未満|以下|以内', 'ลงมา', 'से कम|से नीचे')
const aboveAfter = words('以上|超', 'ขึ้นไป', 'से अधिक|से ज़्यादा|से ज्यादा|से ऊपर')
const aboutAfter = words('左右|くらい|ぐらい|程度|前後|ほど')
const percentWords = words(
  'percent',
  'por ciento|porcentaje|por cento',
  'prozent|pour cent|pourcent|persen',
  'パーセント|เปอร์เซ็นต์|เปอร์เซนต์',
  'प्रतिशत|फ़ीसदी|फीसदी'
)
const digit = '0-9０-９०-९๐-๙'
const number = `[${digit}]+(?:[.,．][${digit}]+)?`
const percent = `(?:\\s*[%％﹪]|\\s*(?:${alternatives(percentWords)}))`
const qualifier = `(?:${alternatives([...below, ...above, ...about])})`
const after = `(?:\\s*(?:${alternatives([...belowAfter, ...aboveAfter, ...aboutAfter])}))?`
// English joins a range with "to" or a dash; "and" stays unread there.
const to = `(?:to|[-–—〜～]|から|至|到|ถึง|bis|sampai|hingga|से)`
const chineseNumber = '[零〇一二两三四五六七八九十百点]+'

/**
 * Percentage tokens in a sentence: a qualifier, a number or range and a
 * percent sign or word, in any enabled language (“less than 0.5%”,
 * “menos del 5 %”, “30パーセント未満”, “百分之三十”, “लगभग ३० प्रतिशत”).
 */
export const statedPercentPattern = new RegExp(
  [
    `${qualifier}?\\s*${number}${percent}(?:\\s*(?:${to}|±|\\+\\/-)\\s*${number}${percent})?${after}`,
    `${number}\\s*${to}\\s*${number}${percent}${after}`,
    `${qualifier}?\\s*(?:百分之|ร้อยละ)\\s*(?:${number}|${chineseNumber})${after}`,
    `(?<!\\p{L})(?:entre|zwischen|antara)\\s+${number}${percent}?\\s*(?:y|e|et|und|dan)\\s+${number}${percent}`,
    `(?<!\\p{L})(?:del|de|von|dari)\\s+${number}${percent}?\\s*(?:al|a|à|ao|bis|hingga|sampai)\\s+${number}${percent}`
  ].join('|'),
  'giu'
)

const chineseDigits: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9
}
/** A Chinese numeral from 0 to 100, with an optional 点 decimal. */
function chineseValue(text: string) {
  const [whole = '', fraction] = text.split('点')
  let value = 0
  let current = 0
  for (const char of whole) {
    if (char === '百') {
      value += (current || 1) * 100
      current = 0
    } else if (char === '十') {
      value += (current || 1) * 10
      current = 0
    } else current = chineseDigits[char] ?? 0
  }
  value += current
  return fraction
    ? `${value}.${Array.from(fraction, (char) => chineseDigits[char] ?? 0).join('')}`
    : String(value)
}

/** NFKC plus Devanagari, Thai and Chinese numerals as ASCII digits. */
export function normalizeNumerals(text: string) {
  return text
    .normalize('NFKC')
    .replace(/[०-९]/gu, (char) => String(char.charCodeAt(0) - 0x966))
    .replace(/[๐-๙]/gu, (char) => String(char.charCodeAt(0) - 0xe50))
    .replace(
      /(百分之|ร้อยละ)\s*([零〇一二两三四五六七八九十百点]+)/gu,
      (_, prefix: string, numeral: string) => prefix + chineseValue(numeral)
    )
}

/** The numbers in a stated percentage token; decimal commas read as points. */
export function percentValues(token: string) {
  return (
    normalizeNumerals(token)
      .match(/\d+(?:[.,]\d+)?/gu)
      ?.map((value) => Number(value.replace(',', '.'))) ?? []
  )
}

const prefixed = (words: string[]) =>
  new RegExp(
    `^(?:${alternatives(words.map((word) => word.normalize('NFKC')))})`,
    'iu'
  )
const suffixed = (words: string[]) =>
  new RegExp(
    `(?:${alternatives(words.map((word) => word.normalize('NFKC')))})$`,
    'iu'
  )
const isBelow = [prefixed(below), suffixed(belowAfter)]
const isAbove = [prefixed(above), suffixed(aboveAfter)]

/**
 * Bounds for a percentage the participant wrote. Qualifiers keep their
 * meaning ("less than 1%" is [0, 1%]); a margin of error is not a range.
 */
export function statedBounds(token: string): [number, number] | undefined {
  const text = normalizeNumerals(token).trim()
  if (/±|\+\/-/u.test(text)) return undefined
  const values = percentValues(text)
  if (!values.length || values.some((value) => value > 100)) return undefined
  const low = Math.min(...values) / 100
  const high = Math.max(...values) / 100
  if (isBelow.some((pattern) => pattern.test(text))) return [0, high]
  if (isAbove.some((pattern) => pattern.test(text))) return [low, 1]
  return [low, high]
}
