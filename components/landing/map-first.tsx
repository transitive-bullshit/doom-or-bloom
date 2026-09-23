'use client'

import { PreviewMap, StartLink, type VariantProps } from './shared'

export function MapFirst(props: VariantProps) {
  return (
    <section className='landing-map-first landing-surface'>
      <div className='landing-map-copy'>
        <h1>
          Where do
          <br /> you <span className='landing-soft'>land?</span>
        </h1>
        <p className='landing-description'>
          Map your AI worldview, and see how it compares with others.
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
