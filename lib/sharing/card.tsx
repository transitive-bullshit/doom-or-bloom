import { z } from 'zod'
const coordinate = z.number().finite().min(0).max(1)
const range = z.tuple([coordinate, coordinate]).refine(([a, b]) => a <= b)
export const cardSchema = z.strictObject({
  horizontal: coordinate.nullable(),
  vertical: coordinate.nullable(),
  horizontalRange: range,
  verticalRange: range,
  provisional: z.boolean()
})
export type CardData = z.infer<typeof cardSchema>
export function ShareCard({ data }: { data?: CardData }) {
  const x = data?.horizontal,
    y = data?.vertical
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#f7f6f2',
        color: '#22252a',
        padding: 52,
        fontFamily: 'sans-serif',
        gap: 48
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 530,
          justifyContent: 'center',
          gap: 22
        }}
      >
        <div style={{ fontSize: 20, color: '#646a71' }}>DOOM OR BLOOM</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.05 }}>
          What does AI mean for our future?
        </div>
        <div style={{ fontSize: 25, color: '#646a71', lineHeight: 1.4 }}>
          {data
            ? data.provisional
              ? 'My provisional AI worldview map'
              : 'My AI worldview map'
            : 'Map your AI worldview, one question at a time.'}
        </div>
        <div style={{ fontSize: 16, color: '#646a71' }}>
          doom-or-bloom.com · Experimental
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
          width: 440
        }}
      >
        <div style={{ fontSize: 16, color: '#646a71' }}>
          More demonstrated reasoning ↑
        </div>
        <div
          style={{
            position: 'relative',
            width: 440,
            height: 330,
            background: 'linear-gradient(90deg, #f0dfdc, #dce9df)',
            borderRadius: 14,
            border: '1px solid #d0d3cb'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 220,
              top: 0,
              height: 330,
              width: 1,
              backgroundColor: '#c3c8c0'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 165,
              left: 0,
              width: 440,
              height: 1,
              backgroundColor: '#c3c8c0'
            }}
          />
          {data && (
            <div
              style={{
                position: 'absolute',
                left: data.horizontalRange[0] * 440,
                top: (1 - data.verticalRange[1]) * 330,
                width: Math.max(
                  2,
                  (data.horizontalRange[1] - data.horizontalRange[0]) * 440
                ),
                height: Math.max(
                  2,
                  (data.verticalRange[1] - data.verticalRange[0]) * 330
                ),
                border: '2px solid #5e7767',
                backgroundColor: '#678b7422',
                borderRadius: 8
              }}
            />
          )}
          {x != null && y != null && (
            <div
              style={{
                position: 'absolute',
                left: x * 440 - 9,
                top: (1 - y) * 330 - 9,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#284e3d',
                border: '3px solid #f7f6f2'
              }}
            />
          )}
          {data && (x == null || y == null) && (
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
          )}
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
          Interpretation range; not an event probability.
        </div>
      </div>
    </div>
  )
}
