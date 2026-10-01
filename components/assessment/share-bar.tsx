'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { DownloadIcon, LinkIcon, Share2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { siteUrl } from '@/lib/site'
import {
  intentUrl,
  shareUrl,
  type ShareTarget
} from '@/lib/sharing/share-caption'

// Product names stay as they are; X's label is a translated action.
const platforms = [
  ['x', null],
  ['threads', 'Threads'],
  ['bluesky', 'Bluesky'],
  ['linkedin', 'LinkedIn']
] as const

/**
 * The owner's share actions, placed at the reveal. Intents only prefill a
 * composer; nothing is posted or published without the participant.
 */
export function ShareBar({
  caption,
  path,
  published,
  downloading,
  disabled,
  onShare,
  onDownload,
  publishControl
}: {
  caption: string
  /** Public page when published, otherwise the home page. */
  path: string
  published: boolean
  downloading: boolean
  disabled: boolean
  onShare: (target: ShareTarget) => void
  onDownload: () => void
  publishControl?: ReactNode
}) {
  const t = useTranslations('Share')
  // Web Share exists on phones and some desktops; decide after hydration.
  const [native, setNative] = useState(false)
  const [origin, setOrigin] = useState(siteUrl)
  useEffect(() => {
    queueMicrotask(() => {
      setNative(typeof navigator.share === 'function')
      setOrigin(window.location.origin)
    })
  }, [])
  const link = `${origin}${path}`
  const copy = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(success)
    } catch {
      toast.error(t('copyFailed'))
    }
  }
  return (
    <section
      aria-labelledby='share-result-title'
      className='flex flex-col gap-4 rounded-xl border bg-card p-4'
    >
      <div className='flex flex-col gap-1'>
        <p id='share-result-title' className='font-medium'>
          {t('title')}
        </p>
        <p className='text-sm text-body-foreground'>
          {published ? t('publishedNote') : t('privateNote')}
        </p>
      </div>
      <p className='rounded-lg bg-muted p-3 text-sm whitespace-pre-line text-body-foreground'>
        {caption}
      </p>
      <div className='flex flex-wrap gap-2'>
        {native && (
          <Button
            type='button'
            className='w-full sm:w-auto'
            disabled={disabled}
            onClick={() => {
              onShare('native')
              void navigator
                .share({ text: caption, url: shareUrl(link, 'native') })
                .catch(() => {
                  /* Closing the share sheet is not an error. */
                })
            }}
          >
            <Share2Icon data-icon='inline-start' aria-hidden='true' />
            {t('share')}
          </Button>
        )}
        {platforms.map(([target, label]) => (
          <Button key={target} asChild variant='outline' size='sm'>
            <a
              href={intentUrl(target, caption, shareUrl(link, target))}
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => {
                onShare(target)
                if (target === 'linkedin')
                  void copy(caption, t('linkedinCopied'))
              }}
            >
              {label ?? t('x')}
            </a>
          </Button>
        ))}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => {
            onShare('copy_link')
            void copy(shareUrl(link, 'copy_link'), t('linkCopied'))
          }}
        >
          <LinkIcon data-icon='inline-start' aria-hidden='true' />
          {t('copyLink')}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={disabled || downloading}
          aria-busy={downloading}
          onClick={onDownload}
        >
          {downloading ? (
            <Spinner data-icon='inline-start' aria-hidden='true' />
          ) : (
            <DownloadIcon data-icon='inline-start' aria-hidden='true' />
          )}
          {downloading ? t('preparingImage') : t('downloadImage')}
        </Button>
      </div>
      {publishControl && (
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4 text-sm text-body-foreground'>
          {publishControl}
        </div>
      )}
    </section>
  )
}
