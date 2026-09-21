import { z } from 'zod'
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

// sRGB equivalents of app/globals.css map roles; the SVG renderer needs sRGB.
const colors = {
  surface: '#0d111b',
  text: '#f6f5f1',
  muted: '#b5bbc5',
  doom: '#ff6367',
  bloom: '#48d779',
  grid: '#49505d'
}
const score = (value: number | null | undefined) =>
  value == null ? 'Unexplored' : `${Math.round(value * 100)} / 100`

function Plot({ data }: { data?: CardData }) {
  const x = data?.horizontal
  const y = data?.transformation
  const yr = data?.transformationRange ?? [0, 1]
  const xr = data?.horizontalRange ?? [0, 1]
  const left = 45,
    top = 42,
    width = 620,
    height = 284
  const px = (value: number) => left + value * width
  const py = (value: number) => top + (1 - value) * height
  const point = x != null && y != null
  const label =
    data?.transformationInterpretation === 'unsettled'
      ? 'Unsettled'
      : data?.transformationInterpretation === 'tentative'
        ? 'Estimate'
        : 'Your view'
  return (
    <svg width={690} height={420} viewBox='0 0 690 420'>
      <defs>
        <linearGradient id='field'>
          <stop stopColor={colors.doom} stopOpacity='.55' />
          <stop offset='.5' stopColor={colors.surface} stopOpacity='.05' />
          <stop offset='1' stopColor={colors.bloom} stopOpacity='.55' />
        </linearGradient>
        <linearGradient id='axis'>
          <stop stopColor={colors.doom} />
          <stop offset='1' stopColor={colors.bloom} />
        </linearGradient>
        <pattern
          id='range'
          width='9'
          height='9'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(35)'
        >
          <line y2='9' stroke={colors.text} strokeOpacity='.08' />
        </pattern>
      </defs>
      <text x={left} y='19' fill={colors.muted} fontSize='14'>
        Scale of transformation
      </text>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx='6'
        fill='url(#field)'
        stroke={colors.grid}
        strokeOpacity='.55'
      />
      {[0.25, 0.5, 0.75].map((value) => (
        <g
          key={value}
          stroke={colors.grid}
          strokeOpacity={value === 0.5 ? 1 : 0.55}
          strokeDasharray={value === 0.5 ? '4 6' : undefined}
        >
          <line x1={px(value)} x2={px(value)} y1={top} y2={py(0)} />
          <line x1={left} x2={px(1)} y1={py(value)} y2={py(value)} />
        </g>
      ))}
      {[0, 0.5, 1].map((value) => (
        <text
          key={value}
          x={left - 12}
          y={py(value) + 5}
          fill={colors.muted}
          fontSize='13'
          textAnchor='end'
        >
          {value * 100}
        </text>
      ))}
      {data && (
        <rect
          x={px(xr[0])}
          y={py(yr[1])}
          width={Math.max(2, (xr[1] - xr[0]) * width)}
          height={Math.max(2, (yr[1] - yr[0]) * height)}
          rx='4'
          fill='url(#range)'
          stroke={colors.text}
          strokeOpacity='.65'
          strokeWidth='1.5'
          strokeDasharray='6 5'
        />
      )}
      {point && (
        <g>
          <path
            d={`M ${left} ${py(y)} H ${px(x)} V ${py(0)}`}
            fill='none'
            stroke={colors.text}
            strokeOpacity='.5'
            strokeDasharray='3 5'
          />
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
      <rect
        x={left}
        y='338'
        width={width}
        height='3'
        rx='1.5'
        fill='url(#axis)'
      />
      <text x={left} y='375' fill={colors.doom} fontSize='28' fontWeight='700'>
        Doom
      </text>
      <text
        x='355'
        y='371'
        textAnchor='middle'
        fill={colors.muted}
        fontSize='12'
      >
        EXPRESSED OUTLOOK
      </text>
      <text
        x={px(1)}
        y='375'
        textAnchor='end'
        fill={colors.bloom}
        fontSize='28'
        fontWeight='700'
      >
        Bloom
      </text>
      <text x={left} y='400' fill={colors.muted} fontSize='13'>
        Concern about harmful futures
      </text>
      <text
        x={px(1)}
        y='400'
        textAnchor='end'
        fill={colors.muted}
        fontSize='13'
      >
        Hope for beneficial futures
      </text>
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
