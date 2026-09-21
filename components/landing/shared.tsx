'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip'
import { placePortraits } from './map-layout'

export type Example = {
  id: string
  name: string
  short: string
  initials: string
  stance: string
  description: string
  tone: string
  outlook: number | null
  transformation: number | null
  avatar: string
  xUrl?: string | null
  sources?: Array<{ title: string; url: string }>
}
export type VariantProps = { examples: Example[]; variant?: number }
export const resultHref = (id: string, variant?: number) =>
  variant
    ? `/prototypes/landing/personas/${id}?v=${variant}`
    : `/personas/${id}`

export function StartLink() {
  return (
    <Link href='/assessment' className='landing-start'>
      Answer the first question
    </Link>
  )
}

export function ExampleLinks({ examples, variant }: VariantProps) {
  return (
    <div className='landing-examples'>
      <p className='landing-eyebrow'>Or explore a simulated worldview</p>
      <div className='landing-example-links'>
        {examples.map((p) => (
          <Link
            key={p.id}
            href={resultHref(p.id, variant)}
            className='landing-person-link'
          >
            <span className={`landing-dot ${p.tone}`} />
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PreviewMap({ examples, variant }: VariantProps) {
  const plot = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [size, setSize] = useState({ width: 480, height: 260 })
  useEffect(() => {
    const element = plot.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0)
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const plotted = examples.filter(
    (p) => p.outlook !== null && p.transformation !== null
  )
  const diameter = size.width < 320 ? 32 : 40
  const anchors = plotted.map((p) => ({
    x: p.outlook! * size.width,
    y: (1 - p.transformation!) * size.height
  }))
  const portraits = placePortraits(anchors, size.width, size.height, diameter)
  return (
    <TooltipProvider delayDuration={150}>
      <div className='landing-map' data-highlighting={highlighted !== null}>
        <div className='landing-map-heading'>
          <span>How will AI change the world?</span>
          <span className='landing-map-tag'>Example results</span>
        </div>
        <div
          ref={plot}
          className='landing-plot'
          style={{ '--portrait-size': `${diameter}px` } as CSSProperties}
          role='group'
          aria-label='Example outlook and scale of AI transformation map'
        >
          <span className='landing-map-top'>Civilizational change</span>
          <span className='landing-map-bottom'>Incremental change</span>
          <span className='landing-map-doom'>Doom</span>
          <span className='landing-map-bloom'>Bloom</span>
          <svg
            className='landing-map-connectors'
            viewBox={`0 0 ${size.width} ${size.height}`}
            aria-hidden='true'
          >
            {anchors.map((anchor, i) => {
              const portrait = portraits[i]!
              return Math.hypot(anchor.x - portrait.x, anchor.y - portrait.y) >
                3 ? (
                <g
                  key={plotted[i]!.id}
                  data-selected={plotted[i]!.id === highlighted}
                >
                  <line
                    x1={anchor.x}
                    y1={anchor.y}
                    x2={portrait.x}
                    y2={portrait.y}
                  />
                  <circle cx={anchor.x} cy={anchor.y} r={3} />
                </g>
              ) : null
            })}
          </svg>
          {plotted.map((p, i) => (
            <Tooltip key={p.id} disableHoverableContent>
              <TooltipTrigger asChild>
                <Link
                  href={resultHref(p.id, variant)}
                  aria-label={`View ${p.name} results`}
                  data-selected={p.id === highlighted}
                  onPointerEnter={() => setHighlighted(p.id)}
                  onPointerLeave={() => setHighlighted(null)}
                  onFocus={() => setHighlighted(p.id)}
                  onBlur={() => setHighlighted(null)}
                  className={`landing-map-point ${p.tone}`}
                  style={
                    {
                      '--x': `${(portraits[i]!.x / size.width) * 100}%`,
                      '--y': `${(portraits[i]!.y / size.height) * 100}%`
                    } as CSSProperties
                  }
                >
                  <Image
                    src={p.avatar}
                    width={40}
                    height={40}
                    alt=''
                    unoptimized
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent sideOffset={0} className='pointer-events-none'>
                {p.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className='landing-map-legend'>
          {examples.map((p) => (
            <Link
              key={p.id}
              href={resultHref(p.id, variant)}
              onPointerEnter={() => setHighlighted(p.id)}
              onPointerLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(p.id)}
              onBlur={() => setHighlighted(null)}
            >
              <Image
                className='landing-legend-avatar'
                src={p.avatar}
                width={20}
                height={20}
                alt=''
                unoptimized
              />
              {p.short}
            </Link>
          ))}
        </div>
        <p className='landing-map-note'>Simulated personas</p>
      </div>
    </TooltipProvider>
  )
}
