import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { serverEnv } from '@/lib/server/env'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
export const metadata = pageMetadata(publicPages[2]!)

export default function Privacy() {
  const { analytics, posthog } = serverEnv()
  return (
    <article className='content-column space-y-7 py-14 text-sm leading-relaxed'>
      <h1>Privacy</h1>
      <p>
        Your answers and results remain private unless you choose to publish
        them. No sign-up is required.
      </p>

      <h2>Saving and analyzing your answers</h2>
      <p>
        We store submitted answers, results, and limited diagnostic records on
        our server until you delete the assessment. This includes replies that
        could not be used in your results. We may review saved assessments to
        improve the project. Unsubmitted typing stays in your browser.
      </p>
      <p>
        We send submitted answers and relevant assessment context to TypeSafe’s
        Jev to interpret your answers, select follow-ups, and build your
        results. TypeSafe’s own data policies apply to that processing; see{' '}
        <a className='underline' href='https://typesafe.ai'>
          TypeSafe
        </a>{' '}
        for its terms.
      </p>

      <h2>Your browser and account</h2>
      <p>
        A session cookie gives you access to your assessments. Clearing or
        losing it removes anonymous access without deleting your saved data.
        Optional X sign-in lets you recover assessments in another browser. We
        store your account identifier and profile for this purpose. Signing in
        does not publish anything. Unsubmitted drafts do not sync between
        browsers.
      </p>

      <h2>Publishing and deleting</h2>
      <p>
        Publishing makes your submitted conversation and results public and
        allows search engines to index the page. If you publish while signed in,
        your name, photo, and profile link are included. Otherwise, your
        published assessment is anonymous. Diagnostic records stay private.
      </p>
      <p>
        You can make an assessment private again or delete it from My
        assessments. Its public page and data then become unavailable. Cached
        social images may remain for seven days, and external sites may keep
        copies longer. Forks are separate assessments; deleting the original
        does not delete them.
      </p>

      <h2>Analytics and external content</h2>
      <p>
        Vercel page analytics are {analytics ? 'enabled' : 'disabled'} and
        PostHog assessment analytics are {posthog ? 'enabled' : 'disabled'} in
        this build. When enabled, they measure visits and assessment events,
        excluding answer text, reports, and private assessment URLs. Assessment
        events use a random identifier. Session replay and automatic interaction
        tracking are disabled.
      </p>
      <p>
        Embedded X posts may load images and videos from X. Your assessment
        answers are not sent to X. Downloaded reports include your answers and
        may include local debugging records, so review them before sharing.
      </p>
      <WorldviewCtaCard className='mt-12' />
    </article>
  )
}
