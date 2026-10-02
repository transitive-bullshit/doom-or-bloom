import { getLocale, getTranslations } from 'next-intl/server'
import { publicPageMetadata } from '@/lib/metadata'
import { homeJsonLd } from '@/lib/seo/json-ld'
import { JsonLd } from '@/components/json-ld'
import { loadExamples } from '@/components/landing/data'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

// Only public persona data belongs in this shared page cache.
export const dynamic = 'error'
export const revalidate = 172800
export function generateMetadata() {
  return publicPageMetadata('home')
}

export default async function Page() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()])
  const examples = (await loadExamples()).map(
    ({ result, id, slug, name, shortName, avatar }) => ({
      id,
      slug,
      name,
      shortName,
      avatar,
      outlook: result.horizontal.value,
      transformation: result.experiment?.transformation.value ?? null
    })
  )
  return (
    <>
      <JsonLd
        data={homeJsonLd({
          locale,
          siteDescription: t('Metadata.siteDescription'),
          appDescription: t('Pages.home.description')
        })}
      />
      <PageTransition>
        <div className='map-lab-stage'>
          <Prism examples={examples} />
        </div>
      </PageTransition>
    </>
  )
}
