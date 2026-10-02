'use client'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { cn } from 'cn'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const segment =
  'h-full rounded-md border border-transparent px-2.5 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:border-input dark:data-[state=on]:bg-input/30'

/**
 * Switches the result between just the participant and the comparison: the
 * other person's point on the map and the comparison card. A segmented
 * control, so both choices stay visible and the selected one is clear.
 */
export function CompareToggle({
  name,
  avatar,
  shown,
  onShownChange
}: {
  /** The other person as a sentence noun: a name or “your friend”. */
  name: string
  avatar?: string
  shown: boolean
  onShownChange: (shown: boolean) => void
}) {
  const t = useTranslations('Compare')
  return (
    <ToggleGroup
      type='single'
      spacing={1}
      value={shown ? 'compare' : 'self'}
      onValueChange={(value) => {
        // Pressing the selected option again keeps it selected.
        if (value) onShownChange(value === 'compare')
      }}
      aria-label={t('view')}
      className='h-9.5 max-w-full min-w-0 rounded-lg bg-muted p-[3px]'
    >
      <ToggleGroupItem value='self' className={segment}>
        {t('justYou')}
      </ToggleGroupItem>
      <ToggleGroupItem value='compare' className={cn(segment, 'shrink')}>
        {avatar ? (
          <Image
            src={avatar}
            alt=''
            width={16}
            height={16}
            sizes='16px'
            quality={90}
            className='image-outline size-4 shrink-0 rounded-full object-cover'
          />
        ) : (
          <span
            aria-hidden='true'
            className='map-other size-2.5 shrink-0 rotate-45 rounded-[2px] border-2'
          />
        )}
        <span className='truncate'>{t('title', { name })}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
