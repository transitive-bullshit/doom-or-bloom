import { getTranslations } from 'next-intl/server'
import { publicPageMetadata } from '@/lib/metadata'
import { serverEnv } from '@/lib/server/env'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
export function generateMetadata() {
  return publicPageMetadata('privacy')
}

export default async function Privacy() {
  const { analytics, posthog } = serverEnv()
  const t = await getTranslations('Privacy')
  return (
    <article className='content-column flex flex-col gap-5 py-14 text-base leading-relaxed [&>h2]:mt-6 [&>h2]:-mb-2'>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
      <p>{t('storage')}</p>
      <h2>{t('answersTitle')}</h2>
      <p>
        {t.rich('answers1', {
          typesafe: (chunks) => (
            <a className='underline' href='https://typesafe.ai'>
              {chunks}
            </a>
          )
        })}
      </p>
      <p>{t('answers2')}</p>
      <h2>{t('accountTitle')}</h2>
      <p>{t('account')}</p>
      <h2>{t('measurementTitle')}</h2>
      <p>
        {t('measurement1', {
          vercel: analytics ? 'on' : 'off',
          posthog: posthog ? 'on' : 'off'
        })}
      </p>
      <p>{t('measurement2')}</p>
      <h2>{t('publishingTitle')}</h2>
      <p>{t('publishing1')}</p>
      <p>{t('shareLinks')}</p>
      <p>{t('publishing2')}</p>
      <p>{t('publishing3')}</p>
      <p>{t('publishing4')}</p>
      <p>{t('cookie')}</p>

      <WorldviewCtaCard className='mt-12' />
    </article>
  )
}
