import { cn } from 'cn'
import { useTranslations } from 'next-intl'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { WorldviewCta } from '@/components/worldview-cta'

/** Invites a visitor to someone else's result to map their own and compare. */
export function CompareCta({
  name,
  title,
  description,
  compare,
  className
}: {
  name?: string | null
  /** Overrides the default title and description, e.g. on the P(doom) hub. */
  title?: string
  description?: string
  /** Shows the visitor's result beside this one; see lib/sharing/compare.ts. */
  compare?: string
  className?: string
}) {
  const t = useTranslations('Cta')
  return (
    <Card
      className={cn(
        'gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex flex-col gap-1.5'>
        <CardTitle className='text-lg text-balance'>
          {title ?? (name ? t('compareTitle', { name }) : t('cardTitle'))}
        </CardTitle>
        <CardDescription>
          {description ?? t('compareDescription')}
        </CardDescription>
      </div>
      <div className='shrink-0'>
        <WorldviewCta label={t('mapMine')} compare={compare} />
      </div>
    </Card>
  )
}
