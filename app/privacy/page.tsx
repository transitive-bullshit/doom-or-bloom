import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { serverEnv } from '@/lib/server/env'
import { WorldviewCta } from '@/components/worldview-cta'
export const metadata = pageMetadata(publicPages[3]!)

export default function Privacy() {
  const { analytics, posthog } = serverEnv()
  return (
    <article className='mx-auto w-full max-w-2xl space-y-7 px-6 py-14 text-sm leading-relaxed'>
      <h1 className='text-3xl font-semibold tracking-tight'>Privacy</h1>
      <p>
        No account, email, or hosted assessment database is required. Your
        browser stores one assessment, its draft, and its result locally.
        Restart clears that record and creates a new random assessment
        identifier. Downloads stay under your control.
      </p>
      <h2 className='text-lg font-medium'>Where answers go</h2>
      <p>
        For real assessments, your submitted answers and relevant prior usable
        answers travel through this app’s server to TypeSafe for Jev evaluation,
        alongside authored questions and selected reference summaries. They do
        leave your device. We do not claim a particular TypeSafe retention
        policy; consult{' '}
        <a className='underline' href='https://typesafe.ai'>
          TypeSafe
        </a>{' '}
        for its current terms. Server-side assessment storage is temporary
        request deduplication, expiring after two minutes; there is no
        transcript database.
      </p>
      <p>
        Rejected answers are excluded from later scoring context and reports.
        Clearly marked local debugging details can include your submitted text
        and typed judgments. When debug mode is enabled, completed operation
        requests and responses are saved separately in this browser and survive
        refresh. Restart clears that assessment's debug history. They are
        excluded from reports and analytics. Do not share screenshots of those
        details if they contain private information. Avoid entering sensitive
        personal information.
      </p>
      <h2 className='text-lg font-medium'>Optional measurement</h2>
      <p>
        Vercel page analytics are {analytics ? 'enabled' : 'disabled'} in this
        build. PostHog assessment analytics are{' '}
        {posthog ? 'enabled' : 'disabled'}. When enabled, Vercel measures page
        traffic and PostHog receives explicit assessment events. We exclude
        answer text, excerpts, full reports, free-form clarification, and URL
        query strings or hashes. Session replay, heatmaps, autocapture,
        automatic exception collection, and person profiles are disabled.
      </p>
      <p>
        A random per-assessment identifier links events across resumed visits
        and rotates on restart. This is pseudonymous linkage, not mathematical
        anonymity. Enabling PostHog requires its project-level IP-data disposal
        setting. Analytics credentials alone do not enable collection.
      </p>
      <h2 className='text-lg font-medium'>Sharing and clearing</h2>
      <p>
        Source cards may embed public X posts. Post text is fetched through this
        app’s server; embedded profile images, photos, and videos load from X’s
        media servers. Your assessment answers are not sent to X.
      </p>
      <p>
        Card generation sends only map coordinates, interpretation ranges, and
        single-axis scores to this app’s server. Cards contain no raw answers or
        assessment identifier and are not persistently hosted. Map images can
        also be copied or downloaded directly in your browser. A full report
        contains your usable answers and evidence, so review it before sharing.
      </p>
      <p>
        Local progress does not sync across devices. Browser storage can be
        unavailable or cleared. A second tab that changes the assessment pauses
        older tabs to prevent silent overwrites.
      </p>

      <div className='flex flex-wrap justify-center mt-12'>
        <WorldviewCta />
      </div>
    </article>
  )
}
