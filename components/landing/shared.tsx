'use client'

import Link from 'next/link'
import { WorldviewCta } from '@/components/worldview-cta'
import Image from 'next/image'
import { FadeText } from '@/components/assessment/fade-text'
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
  slug: string
  name: string
  possessivePronoun?: 'his' | 'her' | 'their'
  shortName: string
  initials: string
  stance: string
  description: string
  tone: string
  outlook: number | null
  transformation: number | null
  avatar: string
  followers?: number | null
  followersCapturedAt?: string
  pdoom?: number | null
  pdoomLabel?: string
  reasoning?: number | null
  upside?: number | null
  harm?: number | null
  influence?: number | null
  xUrl?: string | null
  profileUrl?: string
  profileLabel?: string
  sourceBriefUpdated?: boolean
  sources?: Array<{ title: string; url: string; summary?: string }>
}
export type VariantProps = { examples: Example[]; variant?: number }
export type MapExample = Pick<
  Example,
  | 'id'
  | 'slug'
  | 'name'
  | 'shortName'
  | 'avatar'
  | 'outlook'
  | 'transformation'
  | 'followers'
  | 'followersCapturedAt'
  | 'pdoom'
  | 'pdoomLabel'
  | 'reasoning'
  | 'upside'
  | 'harm'
  | 'influence'
>
export const resultHref = (slug: string, variant?: number) =>
  variant
    ? `/prototypes/landing/personas/${slug}?v=${variant}`
    : `/users/${slug}`

export function StartLink() {
  return <WorldviewCta />
}

export function ExampleLinks({ examples, variant }: VariantProps) {
  return (
    <div className='landing-examples'>
      <p className='landing-eyebrow'>Or explore a simulated worldview</p>
      <div className='landing-example-links'>
        {examples.map((p) => (
          <Link
            key={p.id}
            href={resultHref(p.slug, variant)}
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

const featuredOrder = [
  'alignment-maximalist',
  'abundance-risk-taker',
  'cautious-builder',
  'frontier-pacer',
  'control-alarmist',
  'anti-doomer',
  'hands-on-agent-builder',
  'safe-superintelligence-researcher',
  'america-first-ai-booster',
  'democratic-ai-steward',
  'equitable-ai-philanthropist',
  'personal-superintelligence-builder',
  'abundance-advocate',
  'concerned-pioneer',
  'world-model-optimist',
  'scientific-steward',
  'democratic-moratorium',
  'practical-optimist',
  'empirical-skeptic',
  'human-centered-spatial-builder',
  'scientist-ai-advocate',
  'rationalist-safety-advocate',
  'alignment-philosopher',
  'institutional-growth-optimist',
  'bubble-critic',
  'competitive-decentralist',
  'biosecurity-abundance-optimist',
  'learning-bottleneck-investigator',
  'open-science-realist',
  'coordinated-scaler',
  'efficient-intelligence-builder',
  'reasoning-frontier-builder',
  'superintelligence-stop-advocate',
  'empirical-control-researcher',
  'takeoff-forecaster',
  'provable-control-advocate',
  'tool-ai-moratorium',
  'digital-succession-optimist',
  'community-ai-critic',
  'language-hype-critic',
  'normal-technology-realist',
  'pro-worker-economist',
  'open-frontier-idealist'
]

export function PreviewMap({ examples, variant }: VariantProps) {
  const legend = [...examples].sort((a, b) => {
    const rank = (id: string) => {
      const index = featuredOrder.indexOf(id)
      return index < 0 ? featuredOrder.length : index
    }
    return rank(a.id) - rank(b.id)
  })
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
                  href={resultHref(p.slug, variant)}
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
                    sizes={`${diameter}px`}
                    quality={90}
                    alt=''
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
          {legend.map((p) => (
            <Link
              key={p.id}
              href={resultHref(p.slug, variant)}
              onPointerEnter={() => setHighlighted(p.id)}
              onPointerLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(p.id)}
              onBlur={() => setHighlighted(null)}
            >
              <Image
                className='landing-legend-avatar'
                src={p.avatar}
                width={30}
                height={30}
                sizes='(max-width: 640px) 42px, 30px'
                quality={90}
                alt=''
              />
              <FadeText lines={1}>{p.name}</FadeText>
            </Link>
          ))}
        </div>
        <p className='landing-map-note'>
          Example results based on simulated users
        </p>
      </div>
    </TooltipProvider>
  )
}
