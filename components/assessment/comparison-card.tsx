'use client'
import Image from 'next/image'
import { SendIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { pdoomTokenLabel } from '@/lib/assessment/present-result'
import type { ComparedWorldview, Comparison } from '@/lib/sharing/compare'

/**
 * The participant's result beside a thought leader's or a friend's card:
 * how aligned they are, plain per-axis differences and P(doom) side by side.
 */
export function ComparisonCard({
  other,
  comparison,
  name,
  sending,
  onSend
}: {
  other: ComparedWorldview
  comparison: Comparison
  /** The other person as a sentence noun: a name or “your friend”. */
  name: string
  sending?: boolean
  /** Sends a friend this participant's own card-only link. */
  onSend?: () => void
}) {
  const root = useTranslations()
  const t = useTranslations('Compare')
  const differences = [
    comparison.outlook && t(`outlook.${comparison.outlook}`, { name }),
    comparison.change && t(`change.${comparison.change}`, { name }),
    comparison.sharedClosest &&
      t('sharedClosest', { closest: comparison.sharedClosest.name })
  ].filter((line): line is string => Boolean(line))
  const token = (value?: string) =>
    value ? pdoomTokenLabel(root, value) : t('pdoomMissing')
  return (
    <Card role='region' aria-labelledby='comparison-title' className='gap-5'>
      <CardHeader>
        <CardDescription
          id='comparison-title'
          className='flex items-center gap-2'
        >
          {other.avatar && (
            <Image
              src={other.avatar}
              alt=''
              width={24}
              height={24}
              className='image-outline size-6 rounded-full object-cover'
            />
          )}
          {t('title', { name: other.name ?? t('friend') })}
        </CardDescription>
        <CardTitle className='text-2xl'>
          {comparison.bucket
            ? t(`bucket.${comparison.bucket}`)
            : t('bucketUnknown')}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        {differences.length > 0 && (
          <ul className='flex list-disc flex-col gap-1.5 pl-5 text-sm text-body-foreground'>
            {differences.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {(comparison.outlook === null || comparison.change === null) && (
          <p className='text-sm text-body-foreground'>{t('unplaced')}</p>
        )}
        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium'>{t('pdoom')}</p>
          <dl className='grid grid-cols-2 gap-3 sm:max-w-md'>
            {[
              { label: t('you'), value: comparison.yourPdoom?.token },
              {
                label: other.name ?? root('Compare.friendLabel'),
                value: other.pdoom?.token
              }
            ].map(({ label, value }) => (
              <div key={label} className='min-w-0 rounded-lg border p-3'>
                <dt className='truncate text-xs text-muted-foreground'>
                  {label}
                </dt>
                <dd
                  className={
                    value
                      ? 'text-2xl font-semibold tracking-tight tabular-nums'
                      : 'pt-1.5 text-sm text-body-foreground'
                  }
                >
                  {token(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-3'>
        {onSend && (
          <Button
            type='button'
            disabled={sending}
            aria-busy={sending}
            onClick={onSend}
          >
            {sending ? (
              <Spinner data-icon='inline-start' aria-hidden='true' />
            ) : (
              <SendIcon data-icon='inline-start' aria-hidden='true' />
            )}
            {t('send')}
          </Button>
        )}
        {other.kind === 'persona' && other.slug && other.name && (
          <Button asChild variant='outline' size='sm'>
            <Link href={`/users/${other.slug}`}>
              {t('viewPersona', { name: other.name })}
            </Link>
          </Button>
        )}
        <p className='text-xs text-muted-foreground'>
          {other.kind === 'persona' && other.name
            ? t('simulated', { name: other.name })
            : t('private')}
        </p>
      </CardFooter>
    </Card>
  )
}
