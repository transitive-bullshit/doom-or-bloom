import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { languageTag } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { publicPageMetadata } from '@/lib/metadata'
import { loadExamples } from '@/components/landing/data'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import { CompareCta } from '@/components/compare-cta'
import { Button } from '@/components/ui/button'
import { HubTable } from '@/components/p-doom/hub-table'
import { Scenarios } from '@/components/p-doom/scenarios'
import { Footnotes, ReadingList } from '@/components/p-doom/sources'
import { hubContent } from '@/lib/p-doom/hub'
import { readingGroups } from '@/lib/p-doom/readings'
import { pdoomDefinition, pdoomGuidePath } from '@/lib/p-doom/copy'
import { pdoomJsonLd } from '@/lib/seo/json-ld'

// Stated numbers come from the verified public statements, and the profiles
// they link to are refreshed with the simulated users. The explainer,
// scenarios and sources are English in every locale; other locales translate
// the chrome and defer to the English page in search (see docs/SEO.md).
export const dynamic = 'error'
export const revalidate = 172800
export function generateMetadata() {
  return publicPageMetadata('pdoom')
}

export default async function Page() {
  const [locale, t, pages, people] = await Promise.all([
    getLocale(),
    getTranslations('PdoomHub'),
    getTranslations('Pages'),
    loadExamples(false)
  ])
  const tag = languageTag(locale)
  const { rows, intro, scenarios, footnotes } = hubContent(people)
  // The page is generated at most every 48 hours.
  const asOf = new Date()
  return (
    <>
      <JsonLd
        data={pdoomJsonLd({
          locale,
          title: pages('pdoom.title'),
          description: pages('pdoom.description'),
          tableName: t('tableTitle'),
          variable: t('stated'),
          asOf: asOf.toISOString().slice(0, 10),
          people: rows,
          sources: rows.map((row) => row.source)
        })}
      />
      <article className='content-column flex flex-col gap-12 py-14 text-base leading-relaxed'>
        <BreadcrumbJsonLd path='/p-doom' />
        <header lang='en' className='flex flex-col gap-5'>
          <h1>What is P(doom)?</h1>
          <p>
            {pdoomDefinition} It is a personal, subjective estimate rather than
            a measurement: someone who says their P(doom) is 10% thinks there is
            roughly a one-in-ten chance that AI goes catastrophically wrong.
          </p>
          <p>
            The term began as shorthand among people who work on AI safety and
            became widely used in 2023, as researchers, founders and critics
            were asked for their number in interviews. Published estimates range
            from near zero to above 90%. Some of that spread is real
            disagreement, and some comes from people answering different
            questions: extinction or loss of control, by 2040 or ever, with or
            without a serious safety effort.
          </p>
          <p>
            Below are the numbers some of the most prominent voices on AI have
            given in public, each in their own words and linked to its source.
            Several well-known figures refuse to give a number, and their
            reasons are part of the story. Six scenarios then describe what
            people fear could actually happen, with the research behind each.
          </p>
          <p lang={tag}>
            <Link
              href={pdoomGuidePath}
              className='underline underline-offset-4'
            >
              {t('guide')}
            </Link>
          </p>
        </header>
        <section
          aria-labelledby='pdoom-table-title'
          className='flex flex-col gap-4'
        >
          <div className='flex flex-col gap-1'>
            <h2 id='pdoom-table-title'>{t('tableTitle')}</h2>
            <p className='text-sm text-muted-foreground'>
              {t('asOf', {
                date: new Intl.DateTimeFormat(tag, {
                  dateStyle: 'long',
                  timeZone: 'UTC'
                }).format(asOf)
              })}
            </p>
          </div>
          <HubTable rows={rows} />
          <p className='text-sm text-muted-foreground'>{t('note')}</p>
          <div className='flex flex-col items-start gap-2 rounded-xl border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-muted-foreground'>
              {t('allUsersDescription')}
            </p>
            <Button variant='outline' asChild className='shrink-0'>
              <Link href='/users' prefetch={false}>
                {t('allUsers', { count: people.length })}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
        <section
          aria-labelledby='pdoom-scenarios-title'
          className='flex flex-col gap-5'
        >
          <h2 id='pdoom-scenarios-title'>{t('scenariosTitle')}</h2>
          <Scenarios intro={intro} scenarios={scenarios} lang={tag} />
        </section>
        <CompareCta title={t('ctaTitle')} description={t('ctaDescription')} />
        <section
          aria-labelledby='pdoom-sources-title'
          className='reference-breakout flex flex-col gap-5 border-t pt-10'
        >
          <h2 id='pdoom-sources-title'>{t('sourcesTitle')}</h2>
          <Footnotes footnotes={footnotes} />
        </section>
        <section
          aria-labelledby='pdoom-reading-title'
          className='reference-breakout flex flex-col gap-6'
        >
          <div className='flex flex-col gap-2'>
            <h2 id='pdoom-reading-title'>{t('readingTitle')}</h2>
            <p lang='en' className='text-body-foreground'>
              The essential reading on why many researchers think advanced AI
              could end in catastrophe, followed by the strongest critiques.
            </p>
          </div>
          {readingGroups.map(({ id, readings }) => (
            <section
              key={id}
              aria-labelledby={`reading-${id}`}
              className='flex flex-col gap-4'
            >
              <h3 id={`reading-${id}`}>{t(`readingGroups.${id}`)}</h3>
              <div lang='en'>
                <ReadingList readings={readings} />
              </div>
            </section>
          ))}
        </section>
      </article>
    </>
  )
}
