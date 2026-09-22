'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type PointerEvent, type FocusEvent } from 'react'
import './prism.css'
import type { VariantProps } from '@/components/landing/shared'

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

export function Prism({ examples }: VariantProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const highlighted = hovered ?? focused
  const plotted = examples.filter(
    (p) => p.outlook !== null && p.transformation !== null
  )
  const rank = (id: string) => {
    const index = featuredOrder.indexOf(id)
    return index < 0 ? featuredOrder.length : index
  }
  const legend = [...examples].sort((a, b) => rank(a.id) - rank(b.id))
  const highlightEvents = (id: string) => ({
    onPointerEnter: (event: PointerEvent<HTMLAnchorElement>) => {
      if (
        event.pointerType !== 'touch' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
      )
        setHovered(id)
    },
    onPointerLeave: () => setHovered(null),
    onFocus: (event: FocusEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.matches(':focus-visible')) {
        setHovered(null)
        setFocused(id)
      }
    },
    onBlur: () => setFocused(null)
  })
  return (
    <section
      className='map-study study-prism prism-theme'
      data-highlighting={highlighted !== null}
    >
      <header className='study-heading'>
        <p className='study-kicker'>THE AI WORLDVIEW MAP</p>
        <h1>A world of possible futures.</h1>
        <div className='study-intro'>
          <p>Where do you land?</p>
          <Link className='study-cta' href='/assessment'>
            Answer the first question
          </Link>
        </div>
      </header>
      <div className='study-axis-top'>Civilizational change</div>
      <div
        className='study-chart'
        role='group'
        aria-label='AI outlook and scale of transformation. Open a portrait to explore their simulated worldview.'
      >
        <div className='study-cross-x' />
        <div className='study-cross-y' />
        <span className='study-doom'>Doom</span>
        <span className='study-bloom'>Bloom</span>
        {plotted.map((p) => (
          <Link
            key={p.id}
            href={`/personas/${p.slug}`}
            className='study-point study-portrait'
            style={{
              left: `${p.outlook! * 100}%`,
              top: `${(1 - p.transformation!) * 100}%`
            }}
            data-highlighted={p.id === highlighted}
            aria-label={`View ${p.name} results`}
            {...highlightEvents(p.id)}
          >
            <Image src={p.avatar} alt='' width={40} height={40} unoptimized />
            <span>{p.name}</span>
          </Link>
        ))}
      </div>
      <div className='study-axis-bottom'>Incremental change</div>
      <div className='landing-map-legend study-legend'>
        {legend.map((p) => (
          <Link
            key={p.id}
            href={`/personas/${p.slug}`}
            {...highlightEvents(p.id)}
          >
            <Image
              className='landing-legend-avatar'
              src={p.avatar}
              alt=''
              width={20}
              height={20}
              unoptimized
            />
            {p.shortName}
          </Link>
        ))}
      </div>
      <p className='study-note'>Example results based on simulated personas</p>
    </section>
  )
}
