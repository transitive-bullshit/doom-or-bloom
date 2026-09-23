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
  pdoomToken: z.string().max(120).optional(),
  generatedAt: z.iso.datetime({ offset: true }).optional(),
  closestPersonaIds: z.array(z.string().max(100)).max(3).default([]),
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

export function Plot({
  data,
  pointLabel,
  portrait,
  points = []
}: {
  data?: CardData
  pointLabel?: string
  portrait?: string
  points?: { x: number; y: number; portrait?: string }[]
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
      {points.map(({ x, y, portrait: photo }, index) => (
        <g key={index}>
          {photo ? (
            <>
              <defs>
                <clipPath id={`portrait-${index}`}>
                  <circle cx={px(x)} cy={py(y)} r='15' />
                </clipPath>
              </defs>
              <image
                href={photo}
                x={px(x) - 15}
                y={py(y) - 15}
                width='30'
                height='30'
                preserveAspectRatio='xMidYMid slice'
                clipPath={`url(#portrait-${index})`}
              />
              <circle
                cx={px(x)}
                cy={py(y)}
                r='15'
                fill='none'
                stroke={colors.text}
                strokeWidth='1.5'
              />
            </>
          ) : (
            <circle
              cx={px(x)}
              cy={py(y)}
              r='5'
              fill={colors.surface}
              stroke={colors.text}
              strokeWidth='1.5'
            />
          )}
        </g>
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
          {portrait ? (
            <>
              <defs>
                <clipPath id='subject-portrait'>
                  <circle cx={px(x)} cy={py(y)} r='24' />
                </clipPath>
              </defs>
              <image
                href={portrait}
                x={px(x) - 24}
                y={py(y) - 24}
                width='48'
                height='48'
                preserveAspectRatio='xMidYMid slice'
                clipPath='url(#subject-portrait)'
              />
              <circle
                cx={px(x)}
                cy={py(y)}
                r='24'
                fill='none'
                stroke={colors.text}
                strokeWidth='3'
              />
            </>
          ) : (
            <>
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
            </>
          )}
          <g
            transform={`translate(${Math.max(left + 52, Math.min(px(1) - 52, px(x)))},${y > 0.9 ? py(y) + (portrait ? 44 : 32) : py(y) - (portrait ? 44 : 29)})`}
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
        <text x='355' y='188' textAnchor='middle' fill='#25392b' fontSize='20'>
          Still unplaced
        </text>
      )}
    </svg>
  )
}

export function ShareCard({
  data,
  date,
  matches = []
}: {
  data?: CardData
  date?: string
  matches?: { id: string; name: string; portrait: string }[]
}) {
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
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: -1,
          height: 70,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {data ? 'My AI Worldview' : 'Where do you land?'}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 36,
          marginTop: 12
        }}
      >
        <Plot data={data} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 350,
            paddingTop: 16,
            gap: 24
          }}
        >
          {data ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ color: colors.muted, fontSize: 18 }}>
                  P(doom) estimate
                </div>
                <div
                  style={{
                    fontSize: data.pdoom == null ? 30 : 52,
                    fontWeight: 700,
                    letterSpacing: -1
                  }}
                >
                  {data.pdoomToken?.replaceAll('≈', '~').replaceAll('–', '-') ??
                    (data.pdoom == null
                      ? 'Not estimated'
                      : `~${Math.round(data.pdoom * 100)}%`)}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  borderTop: `1px solid ${colors.grid}`,
                  paddingTop: 20
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  My closest worldviews
                </div>
                {matches.length ? (
                  matches.map((person) => (
                    <div
                      key={person.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                      <img
                        src={person.portrait}
                        alt=''
                        width={54}
                        height={54}
                        style={{
                          borderRadius: 27,
                          objectFit: 'cover',
                          border: '2px solid #4c4c45'
                        }}
                      />
                      <div style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>
                        {person.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 16, color: colors.muted }}>
                    Not enough shared evidence yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.3 }}>
              What do you think AI means for our future?
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'auto',
          fontSize: 13,
          color: colors.muted
        }}
      >
        <span style={{ flex: 1 }}>
          {data
            ? 'Dashed area: interpretation range'
            : 'Map your AI worldview, one question at a time.'}
        </span>
        {date && <span>{date}</span>}
        <span style={{ flex: 1, textAlign: 'right' }}>doom-or-bloom.com</span>
      </div>
    </div>
  )
}
