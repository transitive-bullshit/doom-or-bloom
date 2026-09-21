import type { ComponentProps } from 'react'

export default function Image({
  fill,
  unoptimized: _unoptimized,
  ...props
}: ComponentProps<'img'> & { fill?: boolean; unoptimized?: boolean }) {
  return (
    <img
      {...props}
      style={
        fill
          ? {
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              ...props.style
            }
          : props.style
      }
    />
  )
}
