import type { ReactNode } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { publicPageMetadata } from '@/lib/metadata'
import { Link } from '@/i18n/navigation'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { JsonViewer } from '@/components/debug/json-viewer'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'
import { aboutJsonLd } from '@/lib/seo/json-ld'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'

// The example assessment is public persona data, refreshed with the page.
export const dynamic = 'error'
export const revalidate = 86400
export function generateMetadata() {
  return publicPageMetadata('about')
}

const external = (href: string, rel = 'noopener noreferrer') =>
  function ExternalLink(chunks: ReactNode) {
    return (
      <a
        className='underline underline-offset-4'
        href={href}
        rel={rel}
        target='_blank'
      >
        {chunks}
      </a>
    )
  }

export default async function About() {
  const personaId = 'abundance-risk-taker'
  const [examples, assessment, t, pages, locale] = await Promise.all([
    loadExamples(),
    loadPersonaAssessment(personaId),
    getTranslations('About'),
    getTranslations('Pages'),
    getLocale()
  ])
  const person = examples.find((example) => example.id === personaId)
  return (
    <article className='content-column space-y-10 py-14 text-base leading-relaxed'>
      {/* Hidden, so it adds no gap or margin. */}
      <BreadcrumbJsonLd path='/about' />
      <JsonLd
        data={aboutJsonLd({
          locale,
          name: pages('about.title'),
          description: pages('about.description')
        })}
      />
      <header className='space-y-5'>
        <h1>{t('title')}</h1>
        <p>{t('question')}</p>
        <p>
          {t.rich('intro', {
            source: external(
              'https://github.com/transitive-bullshit/doom-or-bloom'
            )
          })}
        </p>
      </header>

      <section className='space-y-3'>
        <h2>{t('whyTitle')}</h2>
        <p>{t('why1')}</p>
        <p>{t('why2')}</p>
      </section>

      <section className='space-y-3'>
        <h2>{t('interviewTitle')}</h2>
        <p>{t('interview1')}</p>
        <p>{t('interview2')}</p>
      </section>

      <section className='space-y-4'>
        <h2>{t('jevTitle')}</h2>
        <p>{t.rich('jev1', { jev: external('https://typesafe.ai') })}</p>
        <p>{t('jev2')}</p>
      </section>

      {person && assessment?.finalState && (
        <section className='space-y-4'>
          <h2>{t('exampleTitle')}</h2>
          <p>
            {t.rich('example', {
              link: (chunks) => (
                <Link
                  className='underline underline-offset-4'
                  href={`/users/${person.slug}`}
                  prefetch={true}
                >
                  {chunks}
                </Link>
              )
            })}
          </p>
          <div className='grid min-w-0 grid-cols-1 gap-5'>
            <div className='min-w-0 space-y-2'>
              <h3>{t('inputTitle')}</h3>
              <JsonViewer
                label={t('inputLabel')}
                value={assessment.finalState}
                initialExpandedDepth={1}
              />
              <p className='text-xs text-muted-foreground'>{t('inputNote')}</p>
            </div>
            <div className='min-w-0 space-y-2'>
              <h3>{t('resultTitle')}</h3>
              <JsonViewer
                label={t('resultLabel')}
                value={person.result}
                initialExpandedDepth={1}
              />
              <p className='text-xs text-muted-foreground'>{t('resultNote')}</p>
            </div>
          </div>
        </section>
      )}

      <section className='space-y-3'>
        <h2>{t('simulatedTitle')}</h2>
        <p>{t('simulated1')}</p>
        <p>{t('simulated2')}</p>
      </section>

      <section className='space-y-3'>
        <h2>{t('mapTitle')}</h2>
        <p>{t('map1')}</p>
        <p>
          {t.rich('map2', {
            b: (chunks) => <span className='font-bold'>{chunks}</span>
          })}
        </p>
        <p>{t('map3')}</p>
      </section>

      <section className='space-y-3'>
        <h2>{t('answersTitle')}</h2>
        <p>
          {t.rich('answers', {
            privacy: (chunks) => (
              <Link className='underline underline-offset-4' href='/privacy'>
                {chunks}
              </Link>
            )
          })}
        </p>
      </section>

      <section className='space-y-3'>
        <h2>{t('nextTitle')}</h2>
        <p>{t('next1')}</p>
        <p>
          {t.rich('next2', {
            feedback: external(
              'https://github.com/transitive-bullshit/doom-or-bloom/issues'
            )
          })}
        </p>
      </section>

      <footer className='border-t pt-8 text-base text-muted-foreground flex flex-col gap-2'>
        <p>
          {t.rich('builtBy', {
            author: external('https://x.com/transitive_bs')
          })}
        </p>
        <p>
          {t.rich('related', {
            related: (chunks) => (
              <a
                className='underline underline-offset-4'
                href='https://cultural-alignment.com'
                target='_blank'
              >
                {chunks}
              </a>
            )
          })}
        </p>
        <p>
          {t.rich('source', {
            github: external(
              'https://github.com/transitive-bullshit/doom-or-bloom'
            )
          })}
        </p>
      </footer>

      <WorldviewCtaCard />
    </article>
  )
}
