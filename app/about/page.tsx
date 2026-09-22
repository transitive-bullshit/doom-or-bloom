import Link from 'next/link'
import { WorldviewCta } from '@/components/worldview-cta'
import { limits } from '@/lib/assessment/schema'
import { JsonViewer } from '@/components/debug/json-viewer'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export default async function About() {
  const personaId = 'abundance-risk-taker'
  const [examples, assessment] = await Promise.all([
    loadExamples(),
    loadPersonaAssessment(personaId)
  ])
  const person = examples.find((example) => example.id === personaId)
  return (
    <article className='mx-auto w-full max-w-2xl space-y-10 px-6 py-14 text-sm leading-relaxed'>
      <header className='space-y-5'>
        <h1 className='text-3xl font-semibold tracking-tight text-balance'>
          A clearer conversation about AI futures
        </h1>
        <p>
          What do you expect from AI, why do you expect it, and what could
          change your mind? Doom or Bloom helps you explore the range of views
          and map your own through a few open-ended questions. No specialist
          knowledge or account required.
        </p>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-4'>
          <WorldviewCta />
          <Link className='underline underline-offset-4' href='/'>
            Explore the map
          </Link>
        </div>
      </header>

      <section className='space-y-3'>
        <h2 className='text-lg font-medium'>Why build this?</h2>
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
        <h2 className='text-lg font-medium'>
          An interview that follows your thinking
        </h2>
        <p>
          Start with what you think AI means for our future—and why. The engine
          looks for gaps or uncertainty in your answer, then chooses the
          prepared question most likely to clarify your worldview with the least
          repetition and effort.
        </p>
        <p>
          Results become available when enough of your perspective is clear,
          potentially after one detailed answer. Interviews stop at{' '}
          {limits.prompts} questions. You can trace interpretations back to your
          answers and clarify anything that feels wrong.
        </p>
      </section>

      <section className='space-y-4'>
        <h2 className='text-lg font-medium'>Powered by TypeSafe’s Jev</h2>
        <p>
          <a
            className='underline underline-offset-4'
            href='https://typesafe.ai'
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
        {person && assessment?.finalState && (
          <>
            <p>
              These JSON blocks come from{' '}
              <Link
                className='underline underline-offset-4'
                href={`/users/${person.slug}`}
              >
                Elon Musk’s simulated assessment
              </Link>
              . Expand fields to inspect them or copy the complete JSON. The
              result includes our calculations, not just raw Jev output.
            </p>
            <div className='grid min-w-0 grid-cols-1 gap-5'>
              <div className='min-w-0 space-y-2'>
                <h3 className='text-sm font-medium'>Assessment input</h3>
                <JsonViewer
                  label='Elon Musk simulated assessment input'
                  value={assessment.finalState}
                  initialExpandedDepth={1}
                />
                <p className='text-xs text-muted-foreground'>
                  The answers and context supplied to Jev.
                </p>
              </div>
              <div className='min-w-0 space-y-2'>
                <h3 className='text-sm font-medium'>Generated results</h3>
                <JsonViewer
                  label='Elon Musk simulated assessment result'
                  value={person.result}
                  initialExpandedDepth={1}
                />
                <p className='text-xs text-muted-foreground'>
                  The result our software builds from its judgments.
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-medium'>Simulated people, real sources</h2>
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
        <h2 className='text-lg font-medium'>The map is not the territory</h2>
        <p>
          The headline map pairs your overall Doom–Bloom outlook with how
          radically you expect AI to transform society. Behind it are eight
          dimensions covering capabilities, transition speed, benefits, harms,
          controllability, institutions, human agency, and action. We also
          consider how you explain your views, including causal clarity,
          uncertainty, and willingness to update.
        </p>
        <p>
          Two coordinates cannot capture a whole worldview. Missing evidence
          stays unplaced, and interpretation ranges show uncertainty about how
          to read your answers—not the probability that your beliefs are true. A
          separate P(doom) estimate is labeled as stated or inferred.
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
        <h2 className='text-lg font-medium'>Your answers stay yours</h2>
        <p>
          No accounts and no persistent answer database. Your browser saves your
          answers, drafts, and results so you can return later. Submitted
          answers pass through our server to Jev for evaluation; a temporary
          retry cache expires after two minutes. TypeSafe’s own data policies
          apply to its processing.
        </p>
        <p>
          Optional analytics exclude answer text. Saved persona examples are
          generated material, not visitor transcripts. Read the{' '}
          <Link className='underline underline-offset-4' href='/privacy'>
            privacy details
          </Link>
          .
        </p>
      </section>

      <section className='space-y-3'>
        <h2 className='text-lg font-medium'>What’s next?</h2>
        <p>
          A future Socratic mode could challenge assumptions, offer well-sourced
          counterexamples, and help strengthen your reasoning. This first
          version focuses on understanding your views without trying to change
          them.
        </p>
        <p>
          The goal is better tools for clear thinking that anyone can use.
          Wherever you fall on the map, I’d love to hear what feels useful, what
          seems wrong, and what’s missing.{' '}
          <a
            className='underline underline-offset-4'
            href='https://github.com/transitive-bullshit/doom-or-bloom/issues'
          >
            Share feedback
          </a>
          .
        </p>
      </section>

      <footer className='border-t pt-6 text-xs text-muted-foreground'>
        Built by{' '}
        <a
          className='underline underline-offset-4'
          href='https://x.com/transitive_bs'
        >
          Travis Fischer
        </a>
        .{' '}
        <a
          className='underline underline-offset-4'
          href='https://github.com/transitive-bullshit/doom-or-bloom'
        >
          Explore the source and methodology
        </a>
        .
      </footer>
    </article>
  )
}
