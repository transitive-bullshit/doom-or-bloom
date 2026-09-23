import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import Link from 'next/link'
import { WorldviewCta } from '@/components/worldview-cta'
import { JsonViewer } from '@/components/debug/json-viewer'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata(publicPages[2]!)

export default async function About() {
  const personaId = 'abundance-risk-taker'
  const [examples, assessment] = await Promise.all([
    loadExamples(),
    loadPersonaAssessment(personaId)
  ])
  const person = examples.find((example) => example.id === personaId)
  return (
    <article className='content-column space-y-10 py-14 text-sm leading-relaxed'>
      <header className='space-y-5'>
        <h1>A clearer conversation about AI futures</h1>
        <p>
          What do you expect from AI, why do you expect it, and what could
          change your mind? Doom or Bloom helps you explore the range of views
          and map your own through a few open-ended questions. No specialist
          knowledge or account required.
        </p>
        <div className='flex flex-wrap justify-center'>
          <WorldviewCta />
        </div>
      </header>

      <section className='space-y-3'>
        <h2>Why build this?</h2>
        <p>
          AI’s potential upsides and risks deserve careful, grounded discussion.
          As capabilities advance and decisions become more consequential, we
          need accessible ways to think clearly across very different views.
        </p>
        <p>
          I built this to explore the field’s voices and help people untangle
          conflicting intuitions. It has already sharpened my own views. The aim
          is to represent yours faithfully, with as little editorial steering as
          possible.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>An interview that follows your thinking</h2>
        <p>
          Start with what you think AI means for our future—and why. The engine
          looks for gaps or uncertainty in your answer, then chooses the
          prepared question most likely to clarify your worldview with the least
          repetition and effort.
        </p>
        <p>
          Results become available when enough of your perspective is clear,
          potentially after one detailed answer. Most interviews last between
          3-5 questions. You can trace interpretations back to your answers and
          clarify anything that feels wrong.
        </p>
      </section>

      <section className='space-y-4'>
        <h2>Powered by TypeSafe’s Jev</h2>
        <p>
          <a
            className='underline underline-offset-4'
            href='https://typesafe.ai'
            rel='noopener noreferrer'
            target='_blank'
          >
            Jev
          </a>{' '}
          helps interpret your answers through small, focused judgments: what
          you expect, what remains uncertain, and which follow-up would help.
          Our software combines those judgments into your profile and selects
          from authored questions. Jev does not write a free-form verdict about
          you.
        </p>
        <p>
          Evaluating many judgments together and reusing unchanged results keeps
          this kind of adaptive interviewing economical. That makes it possible
          to explore tools for clearer thinking at scale.
        </p>
      </section>

      {person && assessment?.finalState && (
        <section className='space-y-4'>
          <h2>Example using Elon Musk</h2>
          <p>
            Here are some example JSON results from{' '}
            <Link
              className='underline underline-offset-4'
              href={`/users/${person.slug}`}
              prefetch={true}
            >
              Elon Musk’s simulated assessment
            </Link>
            .
          </p>
          <div className='grid min-w-0 grid-cols-1 gap-5'>
            <div className='min-w-0 space-y-2'>
              <h3>Assessment input</h3>
              <JsonViewer
                label='Elon Musk simulated assessment input'
                value={assessment.finalState}
                initialExpandedDepth={1}
              />
              <p className='text-xs text-muted-foreground'>
                The answers and context supplied to Jev for a single simulated
                assessment.
              </p>
            </div>
            <div className='min-w-0 space-y-2'>
              <h3>Generated results</h3>
              <JsonViewer
                label='Elon Musk simulated assessment result'
                value={person.result}
                initialExpandedDepth={1}
              />
              <p className='text-xs text-muted-foreground'>
                The combination of judgments our app uses to infer its results.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className='space-y-3'>
        <h2>Simulated people, real sources</h2>
        <p>
          The featured personas are simulations grounded in linked public
          statements, essays, and interviews. A separate model answers the same
          questions from those sources; our assessment engine evaluates the
          answers without a target map position.
        </p>
        <p>
          These examples help us improve interpretations, refine follow-up
          questions, and catch regressions. They are not those people’s actual
          answers or endorsements. Their pages let you inspect the simulated
          answers and the sources behind them.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>The map is not the territory</h2>
        <p>
          The featured map pairs your overall Doom–Bloom outlook with how
          radically you expect AI to transform society. Behind it are eight
          dimensions covering capabilities, transition speed, benefits, harms,
          controllability, institutions, human agency, and action. We also
          consider how well you explain your views, including causal clarity,
          uncertainty, and willingness to update.
        </p>
        <p>
          Two coordinates cannot capture a whole worldview. Missing evidence
          stays unplaced, and interpretation ranges show uncertainty about how
          to read your answers—not the probability that your beliefs are true. A
          separate P(doom) estimate is labeled as either explicitly stated or
          inferred.
        </p>
        <p>
          This is an experiment, not an intelligence test or a validated
          forecast. Answers are not independently fact-checked. Questions,
          sources, and scoring rules involve editorial choices, and the name
          itself may influence your answers. Mixed views, uncertainty, and
          coherent extremes are all valid; agreement with us is not the goal.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>Your answers stay yours</h2>
        <p>
          No sign-up is required. Submitted answers and results are saved on our
          server, private from other visitors. We may inspect assessments to
          improve the project and retain them until you delete them. Unsubmitted
          typing stays in this browser. Jev evaluates submitted answers under
          TypeSafe’s data policies.
        </p>
        <p>
          Optional analytics exclude answer text. Saved persona examples are
          generated material, not visitor transcripts. Read the{' '}
          <Link className='underline underline-offset-4' href='/privacy'>
            privacy policy
          </Link>{' '}
          for more details.
        </p>
      </section>

      <section className='space-y-3'>
        <h2>What’s next?</h2>
        <p>
          This first version focuses on understanding your views without trying
          to change them. A future Socratic mode could challenge assumptions,
          offer well-sourced counterexamples, and help strengthen your
          reasoning.
        </p>
        <p>
          The goal is better tools for clear thinking that anyone can use.
          Wherever you fall on the map, I’d love to hear what feels useful, what
          seems wrong, and what’s missing.{' '}
          <a
            className='underline underline-offset-4'
            href='https://github.com/transitive-bullshit/doom-or-bloom/issues'
            rel='noopener noreferrer'
            target='_blank'
          >
            Share feedback on GitHub
          </a>
          .
        </p>
      </section>

      <footer className='border-t pt-6 text-xs text-muted-foreground flex flex-col gap-2'>
        <p>
          Built by{' '}
          <a
            className='underline underline-offset-4'
            href='https://x.com/transitive_bs'
            rel='noopener noreferrer'
            target='_blank'
          >
            Travis Fischer
          </a>
          .
        </p>
        <p>
          Explore the source on{' '}
          <a
            className='underline underline-offset-4'
            href='https://github.com/transitive-bullshit/doom-or-bloom'
            rel='noopener noreferrer'
            target='_blank'
          >
            GitHub
          </a>
          .
        </p>
      </footer>

      <div className='flex flex-wrap justify-center'>
        <WorldviewCta />
      </div>
    </article>
  )
}
