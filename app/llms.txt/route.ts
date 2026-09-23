import { publicPages, siteUrl } from '@/lib/site'

import { loadExamples } from '@/components/landing/data'
export const dynamic = 'force-dynamic'

export async function GET() {
  const personaPages = (await loadExamples(false)).map((person) => ({
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
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
