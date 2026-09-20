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
  provisional: z.boolean()
})
export type CardData = z.infer<typeof cardSchema>

function Plot({
  data,
  axis
}: {
  data?: CardData
  axis: 'influence' | 'transformation'
}) {
  const x = data?.horizontal
  const y = data?.[axis]
  const verticalRange = data?.[
    axis === 'influence' ? 'influenceRange' : 'transformationRange'
  ] ?? [0, 1]
  const width = 340,
    height = 310
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        {axis === 'influence' ? 'Human influence ↑' : 'Transformation ↑'}
      </div>
      <div style={{ fontSize: 15, color: '#646a71' }}>
        {axis === 'influence'
          ? 'How much can we shape it?'
          : 'How radically will it change us?'}
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
        {data?.[
          axis === 'influence'
            ? 'influenceInterpretation'
            : 'transformationInterpretation'
        ] === 'unsettled'
          ? 'Unsettled: point marks the center of the open range.'
          : 'Interpretation range; not an event probability.'}
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
        gap: 32
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 340,
          gap: 24
        }}
      >
        <div style={{ fontSize: 20, color: '#646a71' }}>DOOM OR BLOOM</div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>
          What does AI mean for our future?
        </div>
        <div style={{ fontSize: 24, color: '#646a71', lineHeight: 1.4 }}>
          {data
            ? 'Two views of my AI worldview'
            : 'Map your AI worldview, one question at a time.'}
        </div>
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 18 }}>
              Demonstrated reasoning:{' '}
              {data.vertical === null
                ? 'Unexplored'
                : `${Math.round(data.vertical * 100)} / 100`}
            </div>
            <div
              style={{
                position: 'relative',
                height: 8,
                width: 300,
                backgroundColor: '#dce1da',
                borderRadius: 4
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: data.verticalRange[0] * 300,
                  width: Math.max(
                    2,
                    (data.verticalRange[1] - data.verticalRange[0]) * 300
                  ),
                  height: 8,
                  backgroundColor: '#93ad9c',
                  borderRadius: 4
                }}
              />
              {data.vertical !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: data.vertical * 300 - 5,
                    top: -1,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#284e3d'
                  }}
                />
              )}
            </div>
            <div style={{ fontSize: 13, color: '#646a71' }}>
              Reasoning shown in my answers
            </div>
          </div>
        )}
        <div style={{ fontSize: 16, color: '#646a71' }}>
          doom-or-bloom.com · Experimental
          {data?.provisional ? ' · Provisional' : ''}
        </div>
      </div>
      <Plot data={data} axis='influence' />
      <Plot data={data} axis='transformation' />
    </div>
  )
}
