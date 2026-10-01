import { getTranslations } from 'next-intl/server'
import { defaultLocale, localeOptions, localizedPath } from '@/i18n/config'
import { publicPages, siteUrl } from '@/lib/site'
import { blogPosts } from '@/lib/blog/posts'

import { loadExamples } from '@/components/landing/data'
export const dynamic = 'error'
export const revalidate = 172800

// Stays English. Route handlers have no root params, so pass the locale.
export async function GET() {
  const [people, t] = await Promise.all([
    loadExamples(false),
    getTranslations({ locale: defaultLocale, namespace: 'Pages' })
  ])
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
    'Simulated user pages show simulated assessments grounded in public sources, with questions, simulated answers, and source links. These are simulations, not answers submitted by the named people.',
    '',
    'The assessment and interpretation ranges are experimental, not validated measurements or calibrated probabilities. Map coordinates describe beliefs; they are not predictions of event probability.',
    '',
    'Submitted answers and results are persisted in PostgreSQL as immutable snapshots. Assessments are private by default. Anonymous ownership uses a browser session; optional X sign-in makes assessments recoverable across browsers. Unsubmitted typing stays in the browser.',
    '',
    'The start link /assessments?start=1 opens a new draft for a first-time visitor or the existing library. /assessments lists the current owner’s assessments; /assessments/<id> is the private detail route. Drafts are saved only after the first submitted answer. Library statuses are In progress, Ready to publish, and Published. Published assessments are frozen; continuing creates a separate private fork.',
    '',
    'Publishing exposes the answers and inferred results at /public/assessments/<id>. These pages are server-rendered and indexable. The /data subroute provides the published resource, and /social-image.png provides a 1200×630 preview. Unpublishing removes the page, data and preview image; third-party copies may persist. Public access is checked independently of the URL prefix.',
    '',
    '## Pages',
    '',
    ...publicPages.map(
      ({ key, path }) =>
        `- [${t(`${key}.title`)}](${siteUrl}${path}): ${t(`${key}.description`)}`
    ),
    '',
    'The P(doom) page explains the term and lists simulated thought leaders with any publicly stated P(doom), linked to its source, beside a rough estimate inferred from their simulated answers.',
    '',
    '## Blog',
    '',
    `Posts are written in English. RSS: ${siteUrl}/blog/rss.xml`,
    '',
    ...blogPosts().map(
      ({ slug, title, description }) =>
        `- [${title}](${siteUrl}/blog/${slug}): ${description}`
    ),
    '',
    '## Languages',
    '',
    'English pages have unprefixed URLs; other languages add a prefix. The site, the assessment interface and its questions, results, About and Privacy are translated (authored assessment text is machine-translated, with native review of the root question, recovery copy and result claims). Simulated answers and participant answers stay as written, so simulated-user and published assessment pages are indexed in English only. The P(doom) explainer and blog posts are written in English and are also indexed in English only.',
    '',
    ...localeOptions.map(
      ({ code, tag, endonym }) =>
        `- [${endonym}](${siteUrl}${localizedPath('/', code)}) (${tag})`
    ),
    '',
    '## Simulated users',
    '',
    ...personaPages.map(({ path, title }) => `- [${title}](${siteUrl}${path})`),
    ''
  ].join('\n')

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
