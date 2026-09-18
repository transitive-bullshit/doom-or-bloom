import Link from 'next/link'
import { limits, versions } from '@/lib/assessment/schema'
export default function About() {
  return (
    <article className='mx-auto w-full max-w-2xl space-y-7 px-6 py-14 text-sm leading-relaxed'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        A clearer conversation about AI futures
      </h1>
      <p>
        Doom or Bloom helps you articulate what you expect from advanced AI, why
        you expect it, and what could change your mind. A short adaptive
        interview produces a richer profile behind a simple map. A provisional
        result becomes available when supported coverage is sufficient,
        potentially after one detailed answer; most paths take six to eight
        prompts.
      </p>
      <h2 className='text-lg font-medium'>How the assessment works</h2>
      <p>
        Jev, a TypeSafe model, makes narrow typed judgments about your actual
        answers. Code selects from authored questions, preserves exact evidence,
        and combines qualitative categories into a projection. It never
        generates interview questions or a free-form verdict. The local demo
        assesses only the evidence you offer, without checking external sources;
        the interview does not search live news.
      </p>
      <p>
        The horizontal axis combines expected benefits (45%), reversed expected
        harm (45%), and valued human agency and continuity (10%). Policy
        preferences have no map weight. Seven equally weighted components
        describe demonstrated reasoning: causal clarity, scope discipline,
        uncertainty, coherence, engagement with alternatives, updateability, and
        how claims connect to the evidence you offer.
      </p>
      <p>
        Missing evidence is unassessed, rather than scored low. The point uses
        observed components; missing and ambiguous evidence widen the
        interpretation range. Ranges reflect model distributions over authored
        categories, not your probability of an external event or a calibrated
        statistical confidence interval.
      </p>
      <h2 className='text-lg font-medium'>An experiment, with limits</h2>
      <p>
        This is not a psychological instrument, an intelligence test, or a
        probability-of-doom calculator. Technical vocabulary, credentials,
        moderation, and agreement with the authors should not earn points.
        Coherent extreme views can demonstrate stronger reasoning than an
        unsupported middle position.
      </p>
      <p>
        The name foregrounds doom and bloom and may prime your answers. The
        chosen questions, sources, categories, and weights also involve
        editorial judgment. Mixed, uncertain, and low-transformation
        expectations remain valid. Interpretation can be wrong; use “That’s not
        quite my view” to clarify a claim, or inspect the evidence in your
        report.
      </p>
      <h2 className='text-lg font-medium'>Practical details</h2>
      <p>
        A few sentences is plenty. Relevant jokes and honest uncertainty are
        welcome. Unrelated or unclear replies receive bounded re-asks; repeated
        misses pause the interview. Restart clears local progress. The
        assessment warns at {limits.warning} lifetime prompts and stops at{' '}
        {limits.prompts}, including clarification.
      </p>
      <p>
        Versions: assessment {versions.assessment}; content {versions.content};
        rubric {versions.rubric}; Jev {versions.model}. Content expansion and
        evaluation are in progress. Draft releases are labeled in the interface;
        representative design approval is not scientific validation.
      </p>
      <p>
        Built by{' '}
        <a className='underline' href='https://github.com/transitive-bullshit'>
          Travis Fischer
        </a>
        . Explore the{' '}
        <a
          className='underline'
          href='https://github.com/transitive-bullshit/doom-or-bloom'
        >
          source and authored methodology
        </a>
        .
      </p>
      <Link className='underline' href='/'>
        Return to your assessment
      </Link>
    </article>
  )
}
