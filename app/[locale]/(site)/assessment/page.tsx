import { getTranslations } from 'next-intl/server'
import { WorldviewCta } from '@/components/worldview-cta'

export async function generateMetadata() {
  const t = await getTranslations('AssessmentPages')
  return {
    title: t('startTitle'),
    robots: { index: false, follow: true }
  }
}

export default async function Page() {
  const t = await getTranslations('AssessmentPages')
  return (
    <div className='content-column flex flex-col gap-6 py-16'>
      <h1>{t('startHeading')}</h1>
      <p>{t('startDescription')}</p>
      <WorldviewCta />
    </div>
  )
}
