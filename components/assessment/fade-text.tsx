'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/** Keep complete accessible text, fading only when the visible line limit overflows. */
export function FadeText({
  children,
  lines
}: {
  children: string
  lines: 2 | 3
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () =>
      setTruncated(element.scrollHeight > element.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    document.fonts.addEventListener('loadingdone', measure)
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', measure)
    }
  }, [children, lines])
  return (
    <span
      ref={ref}
      className='fade-truncated-text'
      data-truncated={truncated}
      style={{ '--fade-lines': lines } as CSSProperties}
    >
      {children}
    </span>
  )
}
