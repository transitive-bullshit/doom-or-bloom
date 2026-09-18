'use client'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const duration = 13_000
const bursts = [
  { x: 20, y: 40, delay: 0 },
  { x: 75, y: 32, delay: 0.65 },
  { x: 47, y: 23, delay: 1.4 },
  { x: 85, y: 58, delay: 2.2 },
  { x: 28, y: 64, delay: 3.05 },
  { x: 62, y: 43, delay: 3.9 },
  { x: 13, y: 24, delay: 4.7 },
  { x: 80, y: 22, delay: 5.45 },
  { x: 46, y: 55, delay: 6.25 },
  { x: 26, y: 34, delay: 7.1 },
  { x: 70, y: 62, delay: 7.95 },
  { x: 22, y: 36, delay: 8.8 },
  { x: 78, y: 38, delay: 9 },
  { x: 50, y: 23, delay: 9.2 }
]
const colors = [
  'var(--map-doom)',
  'var(--map-bloom)',
  'var(--paperclip-gold)',
  'var(--paperclip-violet)'
]
type ParticleStyle = CSSProperties & Record<`--${string}`, string>

// Fixed trajectories keep the scene reproducible and let CSS animate it without
// a per-frame React render, physics loop or animation dependency.
const fireworks = bursts.map((burst, index) => ({
  ...burst,
  color: colors[index % colors.length],
  particles: Array.from({ length: index >= 11 ? 36 : 26 }, (_, i) => {
    const count = index >= 11 ? 36 : 26
    const angle = (i / count) * Math.PI * 2 + index * 0.47
    const distance = (index >= 11 ? 31 : 23) + ((i * 7) % 11)
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    const rotation = i * 37 + index * 23
    const spin = i % 2 ? 640 : -540
    const style: ParticleStyle = {
      '--clip-x': `${x.toFixed(2)}vmin`,
      '--clip-y': `${y.toFixed(2)}vmin`,
      '--clip-rotation': `${rotation}deg`,
      '--clip-spin': `${spin}deg`,
      animationDelay: `${burst.delay + 0.65 + (i % 3) * 0.04}s`,
      animationDuration: `${2.45 + (i % 4) * 0.1}s`,
      width: `${18 + ((i * 3) % 19)}px`,
      height: `${18 + ((i * 3) % 19)}px`,
      color: colors[(index + (i % 3 === 0 ? 1 : 0)) % colors.length]
    }
    return style
  })
}))

export function Paperclips({ dismiss }: { dismiss: () => void }) {
  const [visible, setVisible] = useState(true)
  const finished = useRef(false)
  function finish() {
    if (finished.current) return
    finished.current = true
    setVisible(false)
    dismiss()
  }
  const finishFromEffect = useEffectEvent(finish)
  useEffect(() => {
    const timeout = window.setTimeout(() => finishFromEffect(), duration)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) finishFromEffect()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])
  if (!visible) return null
  return (
    <div
      className='paperclip-interlude pointer-events-none fixed inset-0 overflow-hidden'
      data-slot='paperclip-interlude'
    >
      <div className='paperclip-effect' aria-hidden='true'>
        <div className='paperclip-backdrop absolute inset-0' />
        {fireworks.map((burst, index) => (
          <div
            key={index}
            className='paperclip-burst absolute'
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              color: burst.color
            }}
          >
            <div
              className='paperclip-launch'
              style={{ animationDelay: `${burst.delay}s` }}
            >
              <Paperclip className='size-7' />
            </div>
            <div
              className='paperclip-ring'
              style={{ animationDelay: `${burst.delay + 0.65}s` }}
            />
            {burst.particles.map((style, i) => (
              <Paperclip key={i} className='paperclip-sprite' style={style} />
            ))}
          </div>
        ))}
      </div>
      <div className='pointer-events-auto absolute top-4 right-4 left-4 sm:left-auto sm:max-w-sm'>
        <Alert role='status'>
          <Paperclip />
          <AlertTitle>Paperclip production has escalated.</AlertTitle>
          <AlertDescription>
            <p>A spectacularly unhelpful amount of paperclips.</p>
            <Button variant='outline' onClick={finish} className='mt-2'>
              <X data-icon='inline-start' />
              Dismiss paperclips
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
