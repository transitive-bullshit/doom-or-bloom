export type PrismColors = {
  coral: string
  peach: string
  lime: string
  mint: string
  violet: string
  veilOpacity: number | string
  grid: string
  border: string
}

const themeColors: PrismColors = {
  coral: 'var(--prism-coral)',
  peach: 'var(--prism-peach)',
  lime: 'var(--prism-lime)',
  mint: 'var(--prism-mint)',
  violet: 'var(--prism-violet)',
  veilOpacity: 'var(--prism-veil-opacity)',
  grid: 'var(--prism-grid)',
  border: 'var(--prism-border)'
}

/** Shared SVG field for interactive results and server-rendered share cards. */
export function PrismField({
  id,
  plot,
  colors = themeColors
}: {
  id: string
  plot: { left: number; top: number; width: number; height: number }
  colors?: PrismColors
}) {
  const { left, top, width, height } = plot
  // Match CSS's 110deg gradient in the physical aspect ratio of this plot.
  const dx = Math.sin((110 * Math.PI) / 180)
  const dy = -Math.cos((110 * Math.PI) / 180)
  const length = width * dx + height * dy
  return (
    <g data-prism-field=''>
      <defs>
        <linearGradient
          id={`${id}-field`}
          gradientUnits='userSpaceOnUse'
          x1={left + width / 2 - (dx * length) / 2}
          y1={top + height / 2 - (dy * length) / 2}
          x2={left + width / 2 + (dx * length) / 2}
          y2={top + height / 2 + (dy * length) / 2}
        >
          <stop stopColor={colors.coral} />
          <stop offset='.3' stopColor={colors.peach} />
          <stop offset='.67' stopColor={colors.lime} />
          <stop offset='1' stopColor={colors.mint} />
        </linearGradient>
        <linearGradient id={`${id}-veil`} x1='0' y1='1' x2='0' y2='0'>
          <stop stopColor={colors.violet} stopOpacity={colors.veilOpacity} />
          <stop offset='1' stopColor={colors.violet} stopOpacity='0' />
        </linearGradient>
      </defs>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        fill={`url(#${id}-field)`}
      />
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        fill={`url(#${id}-veil)`}
        stroke={colors.border}
      />
      <path
        d={`M ${left} ${top + height / 2} H ${left + width} M ${left + width / 2} ${top} V ${top + height}`}
        fill='none'
        stroke={colors.grid}
      />
    </g>
  )
}
