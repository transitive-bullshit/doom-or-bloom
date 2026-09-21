export function AxisRange({
  range,
  value
}: {
  range: [number, number]
  value: number | null
}) {
  return (
    <div aria-hidden='true' className='relative h-2 rounded-full bg-muted'>
      <div
        className='absolute h-full min-w-0.5 rounded-full bg-primary/25'
        style={{
          left: `${range[0] * 100}%`,
          width: `${(range[1] - range[0]) * 100}%`
        }}
      />
      {value !== null && (
        <div
          data-slot='axis-point'
          className='absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary'
          style={{ left: `${value * 100}%` }}
        />
      )}
    </div>
  )
}
