import { useTranslations } from 'next-intl'
import { WorldviewCta } from '@/components/worldview-cta'

/**
 * Phones hide the header CTA, so pages people arrive at from a shared link
 * keep one pinned to the bottom edge.
 */
export function MobileCta({
  compare,
  label
}: {
  compare?: string
  label?: string
} = {}) {
  const t = useTranslations('Cta')
  return (
    <>
      <div aria-hidden='true' className='h-16 sm:hidden' />
      <div className='fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden'>
        <p className='text-sm font-medium'>{t('cardTitle')}</p>
        <WorldviewCta
          size='sm'
          label={label ?? t('mapMine')}
          compare={compare}
        />
      </div>
    </>
  )
}
