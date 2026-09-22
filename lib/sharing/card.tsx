import { z } from 'zod'
import { PrismField } from '@/components/worldview/prism-field'
const coordinate = z.number().finite().min(0).max(1)
const range = z.tuple([coordinate, coordinate]).refine(([a, b]) => a <= b)
export const cardSchema = z.strictObject({
  horizontal: coordinate.nullable(),
  vertical: coordinate.nullable(),
  horizontalRange: range,
  verticalRange: range,
  influence: coordinate.nullable().optional(),
  transformation: coordinate.nullable().optional(),
  influenceRange: range.optional(),
  transformationRange: range.optional(),
  influenceInterpretation: z
    .enum(['supported', 'tentative', 'unsettled'])
    .optional(),
  transformationInterpretation: z
    .enum(['supported', 'tentative', 'unsettled'])
    .optional(),
  upside: coordinate.nullable().optional(),
  harm: coordinate.nullable().optional(),
  upsideRange: range.optional(),
  harmRange: range.optional(),
  pdoom: coordinate.nullable().optional(),
  pdoomRange: range.optional(),
  provisional: z.boolean()
})
export type CardData = z.infer<typeof cardSchema>

// Dark export chrome with the same vivid Prism field in every theme.
const colors = {
  surface: '#161613',
  text: '#f6f5f1',
  muted: '#b5bbc5',
  doom: '#ff6367',
  bloom: '#48d779',
  grid: '#4c4c45'
}
const score = (value: number | null | undefined) =>
  value == null ? 'Unexplored' : `${Math.round(value * 100)} / 100`

export function Plot({
  data,
  pointLabel,
  points = []
}: {
  data?: CardData
  pointLabel?: string
  points?: { x: number; y: number }[]
}) {
  const x = data?.horizontal
  const y = data?.transformation
  const yr = data?.transformationRange ?? [0, 1]
  const xr = data?.horizontalRange ?? [0, 1]
  const left = 85,
    top = 42,
    width = 520,
    height = 284
  const px = (value: number) => left + value * width
  const py = (value: number) => top + (1 - value) * height
  const point = x != null && y != null
  const label =
    data?.transformationInterpretation === 'unsettled'
      ? 'Unsettled'
      : data?.transformationInterpretation === 'tentative'
        ? 'Estimate'
        : (pointLabel ?? 'Your view')
  return (
    <svg width={690} height={420} viewBox='0 0 690 420'>
      <defs>
        <pattern
          id='range'
          width='9'
          height='9'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(35)'
        >
          <line y2='9' stroke='#25392b' strokeOpacity='.08' />
        </pattern>
      </defs>
      <PrismField
        id='card-prism'
        plot={{ left, top, width, height }}
        colors={{
          coral: '#ff786a',
          peach: '#ffb88b',
          lime: '#e6ff80',
          mint: '#aaffbd',
          violet: '#bcb1ff',
          veilOpacity: 0.5,
          grid: '#25392b35',
          border: '#25392b22'
        }}
      />
      <text
        x='345'
        y='26'
        textAnchor='middle'
        fill={colors.muted}
        fontSize='14'
      >
        Civilizational change
      </text>
      <text
        x='345'
        y='357'
        textAnchor='middle'
        fill={colors.muted}
        fontSize='14'
      >
        Incremental change
      </text>
      <text
        x='38'
        y={py(0.5) + 5}
        textAnchor='middle'
        fill={colors.text}
        fontSize='16'
      >
        Doom
      </text>
      <text
        x='651'
        y={py(0.5) + 5}
        textAnchor='middle'
        fill={colors.text}
        fontSize='16'
      >
        Bloom
      </text>
      {points.map(({ x, y }, index) => (
        <circle
          key={index}
          cx={px(x)}
          cy={py(y)}
          r='5'
          fill={colors.surface}
          stroke={colors.text}
          strokeWidth='1.5'
        />
      ))}
      {data && (
        <rect
          x={px(xr[0])}
          y={py(yr[1])}
          width={Math.max(2, (xr[1] - xr[0]) * width)}
          height={Math.max(2, (yr[1] - yr[0]) * height)}
          rx='4'
          fill='url(#range)'
          stroke='#25392b'
          strokeOpacity='.65'
          strokeWidth='1.5'
          strokeDasharray='6 5'
        />
      )}
      {point && (
        <g>
          <circle
            cx={px(x)}
            cy={py(y)}
            r='18'
            fill={colors.text}
            fillOpacity='.12'
          />
          <circle
            cx={px(x)}
            cy={py(y)}
            r='8'
            fill={colors.text}
            stroke={colors.surface}
            strokeWidth='3'
          />
          <g
            transform={`translate(${Math.max(left + 52, Math.min(px(1) - 52, px(x)))},${y > 0.9 ? py(y) + 32 : py(y) - 29})`}
          >
            <rect
              x='-46'
              y='-14'
              width='92'
              height='25'
              rx='12.5'
              fill={colors.text}
            />
            <text
              y='3'
              textAnchor='middle'
              fill={colors.surface}
              fontSize='12'
              fontWeight='600'
            >
              {label}
            </text>
          </g>
        </g>
      )}
      {data && !point && (
        <text
          x='355'
          y='188'
          textAnchor='middle'
          fill={colors.text}
          fontSize='20'
        >
          Still unplaced
        </text>
      )}
    </svg>
  )
}

function SingleAxis({
  label,
  value,
  range = [0, 1],
  probability = false
}: {
  label: string
  value: number | null | undefined
  range?: [number, number]
  probability?: boolean
}) {
  const width = 310
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 16
        }}
      >
        <span style={{ color: colors.muted }}>{label}</span>
        <span style={{ fontWeight: 600 }}>
          {probability && value != null
            ? `${Math.round(value * 100)}%`
            : score(value)}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 6,
          width,
          backgroundColor: colors.grid,
          borderRadius: 3
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: range[0] * width,
            width: Math.max(2, (range[1] - range[0]) * width),
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.muted
          }}
        />
        {value != null && (
          <div
            style={{
              position: 'absolute',
              left: value * width - 6,
              top: -3,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.text,
              border: `2px solid ${colors.surface}`
            }}
          />
        )}
      </div>
      {probability && (
        <div style={{ fontSize: 12, color: colors.muted }}>
          Estimated range: {range.map((v) => Math.round(v * 100)).join('–')}%
        </div>
      )}
    </div>
  )
}

export function ShareCard({ data }: { data?: CardData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.surface,
        color: colors.text,
        padding: 40,
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 82
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontSize: 13, letterSpacing: 2, color: colors.muted }}>
            DOOM OR BLOOM
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            {data ? 'My AI worldview' : 'Where do you land?'}
          </div>
        </div>
        {data && (
          <div style={{ display: 'flex', gap: 12 }}>
            {(
              [
                ['Outlook', data.horizontal],
                ['Scale of transformation', data.transformation]
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '12px 18px',
                  borderRadius: 8,
                  backgroundColor: '#1e222b'
                }}
              >
                <span style={{ color: colors.muted, fontSize: 13 }}>
                  {label}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>
                  {score(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 46,
          marginTop: 12
        }}
      >
        <Plot data={data} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 310,
            gap: 27
          }}
        >
          {data ? (
            <>
              <div style={{ fontSize: 19, fontWeight: 600 }}>
                More of my worldview
              </div>
              <SingleAxis
                label='Expected upside'
                value={data.upside}
                range={data.upsideRange}
              />
              <SingleAxis
                label='Expected harm'
                value={data.harm}
                range={data.harmRange}
              />
              <SingleAxis
                label='Demonstrated reasoning'
                value={data.vertical}
                range={data.verticalRange}
              />
              <SingleAxis
                label='Human influence'
                value={data.influence}
                range={data.influenceRange}
              />
              {data.pdoom != null && (
                <SingleAxis
                  label='Estimated P(doom)'
                  value={data.pdoom}
                  range={data.pdoomRange ?? [data.pdoom, data.pdoom]}
                  probability
                />
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.2 }}>
                What do you think AI means for our future?
              </div>
              <div
                style={{ fontSize: 19, color: colors.muted, lineHeight: 1.5 }}
              >
                Map your AI worldview, one question at a time.
              </div>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 16,
          fontSize: 13,
          color: colors.muted
        }}
      >
        <span>
          {data
            ? data.horizontal == null || data.transformation == null
              ? 'No placement yet · Dashed area: interpretation range'
              : data.transformationInterpretation === 'unsettled'
                ? 'Point: center of unresolved range · Dashed area: interpretation range'
                : 'Point: estimated position · Dashed area: interpretation range'
            : 'Coordinates describe beliefs, not event probabilities.'}
        </span>
        <span>doom-or-bloom.com</span>
      </div>
    </div>
  )
}
