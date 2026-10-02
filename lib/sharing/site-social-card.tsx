/**
 * The site-wide social image: the question beside a quiet version of the
 * featured map. A few recognizable people appear as portraits at their saved
 * positions; everyone else on the featured map is a dot. Generated explicitly
 * with `pnpm social-image:generate`, never at request time.
 */

/** Portraits on the image by simulated-user slug; everyone else is a dot. */
export const siteSocialFaces = [
  'esyudkowsky',
  'sensanders',
  'geoffreyhinton',
  'garymarcus',
  'tszzl',
  'elonmusk',
  'andrewyng',
  'realdonaldtrump'
]

export const siteSocialAlt =
  'How will AI change our future? Doom or Bloom’s map of simulated AI worldviews, with portraits of a few public figures placed by outlook and scale of transformation.'

export type SiteSocialPoint = {
  /** Expressed outlook: 0 is doom, 1 is bloom. */
  outlook: number
  /** Expected transformation: 0 is incremental, 1 is civilizational. */
  transformation: number
  /** A data URL marks a featured portrait; points without one are dots. */
  portrait?: string
}

/** The site card's palette, shared by the blog's post cards. */
export const siteCardColors = {
  surface: '#fbfaf6',
  panel: '#f2f0e9',
  text: '#1d1c18',
  muted: '#77746b',
  axis: 'rgb(29 28 24 / 0.16)',
  dot: 'rgb(29 28 24 / 0.2)'
}
const colors = siteCardColors
// The coordinate area; the panel extends past it so edge portraits stay inside.
const chart = { left: 622, top: 88, width: 512, height: 454 }
const panelPadding = 46
const portraitSize = 82
const dotSize = 10

/**
 * Keep portraits on their saved coordinates. Only portraits that would cover
 * each other move apart, vertically and by the least distance, so outlook
 * (the horizontal position) always stays exact.
 */
export function separateVertically(
  points: readonly { x: number; y: number }[],
  diameter: number,
  gap = 4
) {
  const placed = points.map((point) => ({ ...point }))
  const clearance = diameter + gap
  for (let pass = 0; pass < 200; pass++) {
    let moved = false
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!
        const b = placed[j]!
        const dx = Math.abs(a.x - b.x)
        if (dx >= clearance) continue
        const needed = Math.sqrt(clearance ** 2 - dx ** 2)
        const dy = b.y - a.y
        if (Math.abs(dy) >= needed - 0.01) continue
        const push = (needed - Math.abs(dy)) / 2
        const direction = dy >= 0 ? 1 : -1
        a.y -= direction * push
        b.y += direction * push
        moved = true
      }
    }
    if (!moved) break
  }
  return placed
}

export function siteSocialLayout(points: readonly SiteSocialPoint[]) {
  const position = (point: SiteSocialPoint) => ({
    x: chart.left + point.outlook * chart.width,
    y: chart.top + (1 - point.transformation) * chart.height
  })
  const featured = points.filter((point) => point.portrait)
  const spots = separateVertically(featured.map(position), portraitSize)
  return {
    dots: points.filter((point) => !point.portrait).map(position),
    portraits: featured.map((point, index) => ({
      ...spots[index]!,
      portrait: point.portrait!
    }))
  }
}

export function BrandMark() {
  return (
    <svg width={20} height={20} viewBox='0 0 48 48'>
      <circle cx='24' cy='24' r='24' fill='#ff786a' />
      <path d='M24 0a24 24 0 0 1 0 48c13-13 13-35 0-48' fill='#aaffbd' />
      <path d='M24 0c-13 13-13 35 0 48c13-13 13-35 0-48' fill='#f7f5ef' />
    </svg>
  )
}

export function SiteSocialCard({
  points
}: {
  points: readonly SiteSocialPoint[]
}) {
  const { dots, portraits } = siteSocialLayout(points)
  const panel = {
    left: chart.left - panelPadding,
    top: chart.top - panelPadding,
    width: chart.width + panelPadding * 2,
    height: chart.height + panelPadding * 2
  }
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: 1200,
        height: 630,
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: 'Inter Tight'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 178,
          display: 'flex',
          flexDirection: 'column',
          fontSize: 82,
          lineHeight: 1.02,
          fontWeight: 500,
          letterSpacing: -2.5
        }}
      >
        {['How will AI', 'change our', 'future?'].map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 66,
          top: 560,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 17,
          fontWeight: 500,
          color: colors.muted
        }}
      >
        <BrandMark />
        <span>Doom or Bloom</span>
      </div>
      <div
        style={{
          position: 'absolute',
          ...panel,
          borderRadius: 18,
          backgroundColor: colors.panel
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: panel.left,
          top: chart.top + chart.height / 2,
          width: panel.width,
          height: 1.5,
          backgroundColor: colors.axis
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: chart.left + chart.width / 2,
          top: panel.top,
          width: 1.5,
          height: panel.height,
          backgroundColor: colors.axis
        }}
      />
      {dots.map(({ x, y }, index) => (
        <div
          key={`dot-${index}`}
          style={{
            position: 'absolute',
            left: x - dotSize / 2,
            top: y - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.dot
          }}
        />
      ))}
      {portraits.map(({ x, y, portrait }, index) => (
        <img
          key={`portrait-${index}`}
          src={portrait}
          alt=''
          width={portraitSize}
          height={portraitSize}
          style={{
            position: 'absolute',
            left: x - portraitSize / 2,
            top: y - portraitSize / 2,
            width: portraitSize,
            height: portraitSize,
            borderRadius: portraitSize / 2,
            border: `3px solid ${colors.surface}`,
            boxShadow: '0 2px 8px rgb(34 51 34 / 0.14)',
            objectFit: 'cover'
          }}
        />
      ))}
    </div>
  )
}
