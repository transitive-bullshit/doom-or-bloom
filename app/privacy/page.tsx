import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { serverEnv } from '@/lib/server/env'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
export const metadata = pageMetadata(publicPages[3]!)

export default function Privacy() {
  const { analytics, posthog } = serverEnv()
  return (
    <article className='content-column space-y-7 py-14 text-sm leading-relaxed'>
      <h1>Privacy</h1>
      <p>
        No sign-up is required. A browser session gives you access to your
        private assessments. Submitted answers, rejected replies, results, and
        bounded failure records are saved on our server indefinitely unless you
        delete the assessment. Unsubmitted typing stays in this browser. We may
        inspect saved assessments to improve the project.
      </p>
      <h2>Where answers go</h2>
      <p>
        For real assessments, your submitted answers and relevant prior usable
        answers travel through this app’s server to TypeSafe for Jev evaluation,
        alongside authored questions and selected reference summaries. They do
        leave your device. We do not claim a particular TypeSafe retention
        policy; consult{' '}
        <a className='underline' href='https://typesafe.ai'>
          TypeSafe
        </a>{' '}
        for its current terms. The assessment database is separate from
        TypeSafe’s processing.
      </p>
      <p>
        Rejected replies are retained as conversation history but excluded from
        scoring evidence. Operational diagnostics stay private. Browser debug
        records may also contain submitted text and judgments; avoid sharing
        them inadvertently. Creating a new assessment preserves previous
        assessments. Delete an assessment from My assessments to remove its
        server records.
      </p>
      <h2>Optional account recovery</h2>
      <p>
        Where X sign-in is available, you can link this browser’s assessments to
        your account and recover them in another browser. We store your X
        account identifier and authentication profile. Signing in does not
        publish your assessments or add your X identity to their public pages.
        You can still create and share assessments without signing in.
      </p>
      <h2>Optional measurement</h2>
      <p>
        Vercel page analytics are {analytics ? 'enabled' : 'disabled'} in this
        build. PostHog assessment analytics are{' '}
        {posthog ? 'enabled' : 'disabled'}. When enabled, Vercel measures page
        traffic and PostHog receives explicit assessment events. We exclude
        answer text, excerpts, full reports, private assessment URLs, free-form
        clarification, and URL query strings or hashes. Session replay,
        heatmaps, autocapture, automatic exception collection, and person
        profiles are disabled.
      </p>
      <p>
        A random per-assessment identifier links events across resumed visits
        and changes for each new assessment or fork. This is pseudonymous
        linkage, not mathematical anonymity. Enabling PostHog requires its
        project-level IP-data disposal setting. Analytics credentials alone do
        not enable collection.
      </p>
      <h2>Publishing and deleting</h2>
      <p>
        Publishing makes your full submitted conversation and inferred results
        available to anyone and allows search engines to index the public page.
        If you publish while signed in, your profile name, photo, and profile
        link are included. Anonymous publications stay anonymous unless you make
        them private and publish again while signed in. Operational failure
        records remain private. Making an assessment private or deleting it
        removes access to its page, and data. Cached social images can remain
        available for up to seven days, and external sites may retain previews
        longer. Continuing a published assessment creates a separate private
        copy; changing or deleting the original does not change that copy.
      </p>
      <p>
        Source cards may embed public X posts. Post text is fetched through this
        app’s server; embedded profile images, photos, and videos load from X’s
        media servers. Your assessment answers are not sent to X.
      </p>
      <p>
        Downloaded card generation sends only map coordinates, interpretation
        ranges, and single-axis scores to this app’s server. Cards contain no
        raw answers or assessment identifier and are not persistently hosted.
        Public assessment links also serve a social preview image while the
        assessment is public. Map images can also be copied or downloaded
        directly in your browser. A full report contains your usable answers and
        evidence, so review it before sharing.
      </p>
      <p>
        Anonymous progress is tied to your browser session. Optional X sign-in,
        where available, lets you recover linked assessments in another browser.
        Clearing or expiring cookies loses anonymous access but does not delete
        the server records. Unsubmitted drafts do not sync across devices.
        Concurrent submissions are checked against the saved revision to prevent
        silent overwrites.
      </p>

      <WorldviewCtaCard className='mt-12' />
    </article>
  )
}
