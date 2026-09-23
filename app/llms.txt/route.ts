import { publicPages, siteUrl } from '@/lib/site'

import { loadExamples } from '@/components/landing/data'
export const dynamic = 'force-dynamic'

export async function GET() {
  const people = await loadExamples(false)
  const personaPages = people.map((person) => ({
    path: `/users/${person.slug}`,
    title: person.name
  }))
  const text = [
    '# Doom or Bloom',
    '',
    '> Map your AI worldview, and see how it compares with others. Explore expected benefits, harms, and how much AI could change the world.',
    '',
    'The assessment adapts to your answers and produces a worldview map, estimated P(doom), and details about your views and demonstrated reasoning.',
    '',
    'Public persona pages show simulated assessments grounded in public sources, with questions, simulated answers, and source links. These are simulations, not answers submitted by the named people.',
    '',
    'The assessment and interpretation ranges are experimental, not validated measurements or calibrated probabilities. Map coordinates describe beliefs; they are not predictions of event probability.',
    '',
    'Your answers and results remain private unless you choose to publish them. No sign-up is required; optional X sign-in lets you recover assessments in another browser. See /privacy for data storage and processing details.',
    '',
    'The start link /assessments?start=1 opens a new draft for a first-time visitor or the existing library. /assessments lists the current owner’s assessments; /assessments/<id> is the private detail route. Drafts are saved only after the first submitted answer. Library statuses are In progress, Ready to publish, and Published. Published assessments are frozen; continuing creates a separate private fork.',
    '',
    'Publishing exposes the answers and inferred results at /public/assessments/<id>. These pages are server-rendered and indexable. The /data subroute provides the published resource, and /social-image.webp provides a 1200×630 preview. Unpublishing removes the page and data; cached public images may remain for seven days, and third-party copies may persist longer. Public access is checked independently of the URL prefix.',
    '',
    '## Pages',
    '',
    ...publicPages.map(
      ({ path, title, description }) =>
        `- [${title}](${siteUrl}${path}): ${description}`
    ),
    '',
    '## Simulated personas',
    '',
    ...personaPages.map(({ path, title }) => `- [${title}](${siteUrl}${path})`),
    ''
  ].join('\n')

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}
