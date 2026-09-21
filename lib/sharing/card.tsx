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

function Plot({ data }: { data?: CardData }) {
  const x = data?.horizontal
  const y = data?.transformation
  const verticalRange = data?.transformationRange ?? [0, 1]
  const width = 650,
    height = 310
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        Scale of transformation
      </div>
      <div style={{ fontSize: 15, color: '#646a71' }}>
        Civilizational change at the top · Incremental change at the bottom
      </div>
      <div
        style={{
          position: 'relative',
          width,
          height,
          background: 'linear-gradient(90deg, #f0dfdc, #dce9df)',
          borderRadius: 14,
          border: '1px solid #d0d3cb'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: width / 2,
            top: 0,
            height,
            width: 1,
            backgroundColor: '#c3c8c0'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: height / 2,
            left: 0,
            width,
            height: 1,
            backgroundColor: '#c3c8c0'
          }}
        />
        {data && (
          <div
            style={{
              position: 'absolute',
              left: data.horizontalRange[0] * width,
              top: (1 - verticalRange[1]!) * height,
              width: Math.max(
                2,
                (data.horizontalRange[1] - data.horizontalRange[0]) * width
              ),
              height: Math.max(
                2,
                (verticalRange[1]! - verticalRange[0]!) * height
              ),
              border: '2px solid #5e7767',
              backgroundColor: '#678b7422',
              borderRadius: 8
            }}
          />
        )}
        {x != null && y != null ? (
          <div
            style={{
              position: 'absolute',
              left: x * width - 9,
              top: (1 - y) * height - 9,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#284e3d',
              border: '3px solid #f7f6f2'
            }}
          />
        ) : data ? (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22
            }}
          >
            Still unplaced
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 20
        }}
      >
        <span>Doom</span>
        <span>Bloom</span>
      </div>
      <div style={{ fontSize: 14, color: '#646a71' }}>
        {data?.transformationInterpretation === 'unsettled'
          ? 'Unsettled: point marks the center of the open range.'
          : 'Interpretation range; not an event probability.'}
      </div>
    </div>
  )
}
function SingleAxis({
  label,
  value,
  range = [0, 1]
}: {
  label: string
  value: number | null | undefined
  range?: [number, number]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 16
        }}
      >
        <span>{label}</span>
        <span>
          {value == null ? 'Unexplored' : `${Math.round(value * 100)} / 100`}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 7,
          width: 400,
          backgroundColor: '#dce1da',
          borderRadius: 4
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: range[0] * 400,
            width: Math.max(2, (range[1] - range[0]) * 400),
            height: 7,
            borderRadius: 4,
            backgroundColor: '#93ad9c'
          }}
        />
        {value != null && (
          <div
            style={{
              position: 'absolute',
              left: value * 400 - 5,
              top: -2,
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: '#284e3d'
            }}
          />
        )}
      </div>
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
        alignItems: 'center',
        backgroundColor: '#f7f6f2',
        color: '#22252a',
        padding: 44,
        fontFamily: 'sans-serif',
        gap: 62
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 400,
          gap: 20
        }}
      >
        <div style={{ fontSize: 18, color: '#646a71' }}>DOOM OR BLOOM</div>
        <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>
          {data ? 'My AI worldview' : 'Where do you land?'}
        </div>
        <div style={{ fontSize: 19, color: '#646a71', lineHeight: 1.4 }}>
          {data
            ? 'What I expect from the AI future.'
            : 'Map your AI worldview, one question at a time.'}
        </div>
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
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
              <div style={{ fontSize: 18 }}>
                Estimated P(doom): {Math.round(data.pdoom * 100)}%
                {data.pdoomRange
                  ? ` (range ${data.pdoomRange.map((v) => Math.round(v * 100)).join('–')}%)`
                  : ''}
              </div>
            )}
          </div>
        )}
        <div style={{ fontSize: 13, color: '#646a71' }}>
          doom-or-bloom.com · Interpretation, not a verdict
        </div>
      </div>
      <Plot data={data} />
    </div>
  )
}
