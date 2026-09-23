import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import Link from 'next/link'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'

export const metadata = pageMetadata(publicPages[1]!)

export default function About() {
  return (
    <article className='content-column space-y-10 py-14 text-sm leading-relaxed'>
      <header className='space-y-5'>
        <h1>A clearer conversation about AI futures</h1>
        <p>
          What do you expect from AI, why, and what could change your mind?
          Explore the range of views, then map your own through a few open-ended
          questions. No specialist knowledge or account required.
        </p>
      </header>

      <section className='space-y-3'>
        <h2>Why build this?</h2>
        <p>
          AI’s potential upsides and risks deserve more than slogans. I built
          Doom or Bloom to explore the field’s voices and help people untangle
          conflicting intuitions. The aim is to understand your views without
          trying to change them.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>An interview that follows your thinking</h2>
        <p>
          Start with what you think AI means for our future—and why. Each
          follow-up helps clarify your perspective. Results may be ready after
          one detailed answer; most interviews take just a few questions.
        </p>
        <p>
          See where you land, compare nearby worldviews, and explore the answers
          behind your results.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>Simulated people, real sources</h2>
        <p>
          Featured personas are simulations grounded in linked public
          statements, essays, and interviews. They are not those people’s actual
          answers or endorsements.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>The map is not the territory</h2>
        <p>
          The map pairs your Doom–Bloom outlook with how radically you expect AI
          to transform society. Two coordinates cannot capture a whole
          worldview. Interpretation ranges reflect uncertainty about your
          answers, not the probability that your beliefs are true.
        </p>
        <p>
          This is an experiment, not a validated forecast or an intelligence
          test. Mixed views and uncertainty belong here. Agreement with us is
          not the goal.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>Private unless you publish</h2>
        <p>
          Your answers and results remain private unless you choose to publish
          them. No sign-up is required. Read our{' '}
          <Link className='underline underline-offset-4' href='/privacy'>
            privacy policy
          </Link>{' '}
          for details.
        </p>
      </section>

      <footer className='border-t pt-6 text-xs text-muted-foreground flex flex-col gap-2'>
        <p>
          Built by{' '}
          <a
            className='underline underline-offset-4'
            href='https://x.com/transitive_bs'
          >
            Travis Fischer
          </a>
          . You can{' '}
          <a
            className='underline underline-offset-4'
            href='https://github.com/transitive-bullshit/doom-or-bloom/issues'
          >
            share feedback on GitHub
          </a>
          .
        </p>
      </footer>
      <WorldviewCtaCard />
    </article>
  )
}
