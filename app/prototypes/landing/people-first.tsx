import Link from 'next/link'
import {
  StartLink,
  resultHref,
  type VariantProps
} from '@/components/landing/shared'

export function PeopleFirst({ examples, variant }: VariantProps) {
  return (
    <section className='landing-people landing-surface'>
      <div className='landing-people-intro'>
        <div>
          <p className='landing-eyebrow'>
            One technology. Very different futures.
          </p>
          <h1>
            Doom, bloom,
            <br />
            or <span className='landing-soft'>something else?</span>
          </h1>
        </div>
        <p className='landing-description'>
          Map your AI worldview, one question at a time. Start with a familiar
          perspective—or discover your own.
        </p>
      </div>
      <div className='landing-person-grid'>
        {examples.map((p) => (
          <Link
            key={p.id}
            href={resultHref(p.slug, variant)}
            className={`landing-person-card ${p.tone}`}
          >
            <div className='landing-person-top'>
              <span className='landing-initials' aria-hidden='true'>
                {p.initials}
              </span>
            </div>
            <h2>{p.stance}</h2>
            <p>{p.description}</p>
            <div className='landing-person-credit'>
              <strong>{p.name}</strong>
              <span>Simulated persona · view results</span>
            </div>
          </Link>
        ))}
      </div>
      <div className='landing-people-bottom'>
        <p>
          Their views are a starting point.
          <br />
          <strong>What does your future look like?</strong>
        </p>
        <StartLink />
      </div>
    </section>
  )
}
