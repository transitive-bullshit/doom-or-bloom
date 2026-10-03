import type { CSSProperties } from 'react'

/**
 * The site-wide social image: the question beside a quiet version of the
 * featured map. Recognizable people appear as circular portraits; everyone else
 * is a dot. Generated explicitly
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
  'How will AI change our future? Doom or Bloom’s map of simulated AI worldviews, with portraits of public figures and Doom and Bloom axis labels.'

export type SiteSocialPoint = {
  /** Public simulated-user identity, used only for image art direction. */
  slug?: string
  /** Expressed outlook: 0 is doom, 1 is bloom. */
  outlook: number
  /** Expected transformation: 0 is incremental, 1 is civilizational. */
  transformation: number
  /** A data URL marks a featured portrait; points without one are dots. */
  portrait?: string
}

/** The original editorial palette, retained by the blog post cards. */
export const siteCardColors = {
  surface: '#fbfaf6',
  panel: '#f2f0e9',
  text: '#1d1c18',
  muted: '#77746b',
  axis: 'rgb(29 28 24 / 0.16)',
  dot: 'rgb(29 28 24 / 0.2)'
}
const colors = {
  surface: '#ffffff',
  panel: '#eef1ed',
  text: '#2c352e',
  muted: '#717a70',
  line: '#8f9b8b',
  dot: '#8c9987'
}
const absolute: CSSProperties = { position: 'absolute' }
const portraitSize = 94
const chartPanel = { x: 532, y: 48, width: 604, height: 534 }
const plot = { x: 579, y: 95, width: 510, height: 440 }

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
    x: plot.x + point.outlook * plot.width,
    y: plot.y + (1 - point.transformation) * plot.height
  })
  const featured = points.filter((point) => point.portrait)
  const spots = separateVertically(featured.map(position), portraitSize)
  return {
    dots: points.filter((point) => !point.portrait).map(position),
    portraits: featured.map((point, index) => ({
      ...spots[index]!,
      // Approved image-only offsets, applied after collision spacing. The
      // original 454px plot is the basis; saved worldview coordinates stay intact.
      y:
        spots[index]!.y +
        (point.slug === 'garymarcus'
          ? 90.8
          : point.slug === 'geoffreyhinton'
            ? 45.4
            : 0),
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

function MapSurface() {
  const centerX = chartPanel.x + chartPanel.width / 2
  const centerY = chartPanel.y + chartPanel.height / 2
  return (
    <>
      <div
        style={{
          ...absolute,
          left: chartPanel.x,
          top: chartPanel.y,
          width: chartPanel.width,
          height: chartPanel.height,
          borderRadius: 16,
          backgroundColor: colors.panel,
          boxShadow: '0 3px 16px rgb(55 67 48 / 0.08)'
        }}
      />
      <svg width={1200} height={630} viewBox='0 0 1200 630' style={absolute}>
        <path
          d={`M${chartPanel.x} ${centerY}H${chartPanel.x + chartPanel.width}M${centerX} ${chartPanel.y}V${chartPanel.y + chartPanel.height}`}
          stroke={colors.line}
          strokeOpacity={0.2}
          strokeWidth='1'
          fill='none'
        />
        <rect
          x={chartPanel.x + 2.5}
          y={chartPanel.y + 2.5}
          width={chartPanel.width - 5}
          height={chartPanel.height - 5}
          rx={13.5}
          stroke='#ffffff'
          strokeWidth='5'
          fill='none'
        />
      </svg>
    </>
  )
}

export function SiteSocialCard({
  points
}: {
  points: readonly SiteSocialPoint[]
}) {
  const { dots, portraits } = siteSocialLayout(points)
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
      <MapSurface />
      <svg
        width={36}
        height={24}
        viewBox='0 0 36 24'
        style={{
          ...absolute,
          left: 64,
          // The circles' visible stroke begins 1.35px inside the SVG box.
          top: chartPanel.y - 1.35
        }}
      >
        <g strokeWidth='1.3'>
          <circle
            cx='12'
            cy='12'
            r='10'
            stroke={colors.muted}
            fill='none'
            fillOpacity='0.5'
            strokeOpacity='0.8'
          />
          <circle
            cx='24'
            cy='12'
            r='10'
            stroke={colors.muted}
            fill='none'
            fillOpacity='0.5'
            strokeOpacity='0.8'
          />
        </g>
      </svg>
      <div
        style={{
          ...absolute,
          left: 64,
          top: 176,
          display: 'flex',
          flexDirection: 'column',
          fontSize: 80,
          fontWeight: 500,
          letterSpacing: -2.6,
          lineHeight: 1.04
        }}
      >
        <span>How will AI</span>
        <span>change our</span>
        <span>future?</span>
      </div>
      <div
        style={{
          ...absolute,
          left: 64,
          top: chartPanel.y + chartPanel.height - 20,
          height: 20,
          lineHeight: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 18,
          fontWeight: 500,
          color: colors.muted
        }}
      >
        <BrandMark />
        <span>Doom or Bloom</span>
      </div>
      {dots.map(({ x, y }, index) => (
        <div
          key={`dot-${index}`}
          style={{
            ...absolute,
            left: x - 4.5,
            top: y - 4.5,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: colors.dot,
            opacity: 0.6
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
            ...absolute,
            left: x - portraitSize / 2,
            top: y - portraitSize / 2,
            width: portraitSize,
            height: portraitSize,
            borderRadius: portraitSize / 2,
            border: '3px solid #ffffff',
            boxShadow: '0 3px 8px rgb(36 49 35 / 0.18)',
            objectFit: 'cover'
          }}
        />
      ))}
      {['Doom', 'Bloom'].map((label, index) => (
        <div
          key={label}
          style={{
            ...absolute,
            left: chartPanel.x + index * chartPanel.width - 49,
            top: chartPanel.y + chartPanel.height / 2 - 19,
            width: 98,
            height: 38,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 19,
            backgroundColor: colors.surface,
            color: colors.muted,
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1,
            boxShadow: '0 1px 5px rgb(34 51 34 / 0.12)'
          }}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
