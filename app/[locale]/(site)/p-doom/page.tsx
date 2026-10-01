import { getLocale, getTranslations } from 'next-intl/server'
import { languageTag } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { publicPageMetadata } from '@/lib/metadata'
import { loadExamples } from '@/components/landing/data'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import { CompareCta } from '@/components/compare-cta'
import { PdoomTable } from '@/components/p-doom/pdoom-table'
import { pdoomRows } from '@/lib/p-doom/table'
import { pdoomDefinition, pdoomGuidePath } from '@/lib/p-doom/copy'
import { pdoomJsonLd } from '@/lib/seo/json-ld'

// Public simulated-user data only, refreshed with the profiles it links to.
// The explainer is English in every locale; other locales translate the chrome
// and defer to the English page in search (see docs/SEO.md).
export const dynamic = 'error'
export const revalidate = 172800
export function generateMetadata() {
  return publicPageMetadata('pdoom')
}

export default async function Page() {
  const [locale, root, t, pages, people] = await Promise.all([
    getLocale(),
    getTranslations(),
    getTranslations('PdoomHub'),
    getTranslations('Pages'),
    loadExamples(false)
  ])
  const tag = languageTag(locale)
  const rows = pdoomRows(root, tag, people)
  const stated = rows.filter((row) => row.stated)
  // The table is read when the page is generated, at most every 48 hours.
  const asOf = new Date()
  const columns = {
    name: t('name'),
    stated: t('stated'),
    simulated: t('inferred')
  }
  return (
    <>
      <JsonLd
        data={pdoomJsonLd({
          name: pages('pdoom.title'),
          description: pages('pdoom.description'),
          variables: [columns.stated, columns.simulated],
          asOf: asOf.toISOString().slice(0, 10),
          people: rows,
          citations: stated.map((row) => row.stated!.source.url)
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
            The table lists the thought leaders simulated on Doom or Bloom.
            Where someone has stated a number in public, it appears with its
            source. Every row also shows a rough P(doom) read from a simulated
            interview built from that person’s public writing. That second
            number is our reading of a simulation, not their own estimate.
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
                }).format(asOf),
                count: rows.length,
                stated: stated.length
              })}
            </p>
            <p className='text-sm text-muted-foreground'>
              {t('tableDescription')}
            </p>
          </div>
          <PdoomTable
            rows={rows}
            labels={{
              ...columns,
              sort: {
                name: t('sort', { column: columns.name }),
                stated: t('sort', { column: columns.stated }),
                simulated: t('sort', { column: columns.simulated })
              },
              none: t('none'),
              notEstimated: t('notEstimated'),
              source: t('source')
            }}
          />
          <p className='text-sm text-muted-foreground'>{t('note')}</p>
        </section>
        <CompareCta title={t('ctaTitle')} description={t('ctaDescription')} />
      </article>
    </>
  )
}
