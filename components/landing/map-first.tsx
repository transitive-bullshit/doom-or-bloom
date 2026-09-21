'use client'

import { PreviewMap, StartLink, type VariantProps } from './shared'

export function MapFirst(props: VariantProps) {
  return (
    <section className='landing-map-first landing-surface'>
      <div className='landing-map-copy'>
        <p className='landing-eyebrow'>Your view of the AI future</p>
        <h1>
          Where do
          <br /> you <span className='landing-soft'>land?</span>
        </h1>
        <p className='landing-description'>
          Map your AI worldview, one question at a time. Explore what you
          expect, what you fear, and what could change your mind.
        </p>
        <StartLink />
        <p className='landing-hint'>
          Start with: “What do you think AI means for our future—and why?”
        </p>
      </div>
      <PreviewMap {...props} />
    </section>
  )
}
