import { cn } from 'cn'
import { useTranslations } from 'next-intl'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { WorldviewCta } from '@/components/worldview-cta'

export function WorldviewCtaCard({ className }: { className?: string }) {
  const t = useTranslations('Cta')
  return (
    <Card
      className={cn(
        'mx-auto w-full max-w-[var(--content-width)] items-center gap-6 px-6 text-center',
        className
      )}
    >
      <CardTitle className='text-2xl'>{t('cardTitle')}</CardTitle>
      <CardDescription>{t('cardDescription')}</CardDescription>
      <WorldviewCta />
    </Card>
  )
}
