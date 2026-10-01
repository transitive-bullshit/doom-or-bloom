import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { languageTag } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { SurfaceMessages } from '@/components/surface-messages'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { SharedMap } from '@/components/share-link/shared-map'
import { WorldviewCta } from '@/components/worldview-cta'
import { MobileCta } from '@/components/mobile-cta'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { loadPersonaComparisons } from '@/components/landing/data'
import { findShareLink } from '@/lib/assessments/share-link-server'
import { pdoomTokenLabel } from '@/lib/assessment/present-result'
import { pageMetadata } from '@/lib/metadata'
import { shareLinkImagePath } from '@/lib/sharing/share-link-card'

// A card-only share link: the sharer's map point, P(doom) and closest thought
// leaders, never their answers. Rendered on first request in each language,
// cached like a public page and expired immediately when the link is revoked
// or its assessment deleted. Never indexed or listed in discovery files.
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const link = await findShareLink(id)
  if (!link) notFound()
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('Snapshot')
  ])
  return {
    ...pageMetadata({
      locale,
      translated: false,
      path: `/s/${link.id}`,
      title: link.name
        ? t('metaTitleNamed', { name: link.name })
        : t('metaTitle'),
      description: t('description'),
      image: shareLinkImagePath(link, locale),
      imageAlt: t('imageAlt')
    }),
    robots: { index: false, follow: false },
    // Pages opened from here never learn the link's ID from the referrer.
    referrer: 'strict-origin'
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const link = await findShareLink(id)
  if (!link) notFound()
  const [locale, root, t] = await Promise.all([
    getLocale(),
    getTranslations(),
    getTranslations('Snapshot')
  ])
  const people = await loadPersonaComparisons()
  const closest = link.card.closestPersonaIds.flatMap((personaId) =>
    people.filter((person) => person.id === personaId)
  )
  const token = link.card.pdoomToken
  return (
    <AssessmentPage className='content-column flex flex-col gap-6 pt-6 pb-14'>
      <header className='flex flex-col gap-1'>
        <h1 className='text-balance'>
          {link.name ? t('title', { name: link.name }) : t('titleAnonymous')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t('sharedOn', {
            date: new Intl.DateTimeFormat(languageTag(locale), {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC'
            }).format(new Date(link.createdAt))
          })}
        </p>
      </header>
      <SurfaceMessages surface='shared'>
        <SharedMap card={link.card} />
      </SurfaceMessages>
      <div className='grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>
        <Card className='gap-3'>
          <CardHeader>
            <CardTitle>{t('pdoom')}</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-1'>
            <p className='text-4xl font-semibold tracking-tight tabular-nums'>
              {token ? pdoomTokenLabel(root, token) : t('pdoomMissing')}
            </p>
            {token && link.comparison.pdoomSource && (
              <p className='text-sm text-body-foreground'>
                {link.comparison.pdoomSource === 'stated'
                  ? t('pdoomStated')
                  : t('pdoomInferred')}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className='gap-3'>
          <CardHeader>
            <CardTitle>{t('closest')}</CardTitle>
          </CardHeader>
          <CardContent>
            {closest.length ? (
              <ol className='flex flex-col gap-3'>
                {closest.map((person) => (
                  <li key={person.id}>
                    <Link
                      href={`/users/${person.slug}`}
                      className='flex items-center gap-3 rounded-md font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
                    >
                      <Image
                        src={person.avatar}
                        alt=''
                        width={40}
                        height={40}
                        className='image-outline size-10 rounded-full object-cover'
                      />
                      {person.name}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className='text-sm text-body-foreground'>{t('closestNone')}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card
        role='region'
        aria-labelledby='snapshot-compare-title'
        className='gap-4 border-foreground/20 px-6 py-6 sm:flex-row sm:items-center sm:justify-between'
      >
        <div className='flex flex-col gap-1.5'>
          <CardTitle id='snapshot-compare-title' className='text-xl'>
            {t('ctaTitle')}
          </CardTitle>
          <CardDescription>{t('ctaDescription')}</CardDescription>
        </div>
        <div className='shrink-0'>
          <WorldviewCta label={t('ctaButton')} compare={link.id} />
        </div>
      </Card>
      <p className='text-xs text-muted-foreground'>{t('privacy')}</p>
      <MobileCta compare={link.id} label={t('ctaButton')} />
    </AssessmentPage>
  )
}
