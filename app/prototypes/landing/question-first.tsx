import {
  ExampleLinks,
  StartLink,
  type VariantProps
} from '@/components/landing/shared'

export function QuestionFirst(props: VariantProps) {
  return (
    <section className='landing-question landing-surface'>
      <p className='landing-eyebrow'>
        Map your AI worldview, one question at a time.
      </p>
      <h1>
        What do you think AI means for our future
        <span className='landing-soft'>—and why?</span>
      </h1>
      <div className='landing-question-bottom'>
        <div>
          <p className='landing-description'>
            Start with your own words. A few thoughtful questions turn your
            expectations, doubts, and reasoning into a map.
          </p>
          <StartLink />
        </div>
        <div className='landing-small-spectrum' aria-hidden='true'>
          <span>Doom</span>
          <i />
          <span>Bloom</span>
        </div>
      </div>
      <ExampleLinks {...props} />
    </section>
  )
}
