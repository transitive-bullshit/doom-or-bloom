'use client'
import {
  useEffect,
  useId,
  useState,
  type MouseEvent,
  type ReactNode
} from 'react'
import { DownloadIcon, LinkIcon, Share2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { siteUrl } from '@/lib/site'
import {
  intentUrl,
  shareUrl,
  type LinkKind,
  type ShareTarget
} from '@/lib/sharing/share-caption'
import { sharerNameSchema } from '@/lib/sharing/share-links'
import { ApiError } from '@/lib/assessments/client'
import { copyText } from './clipboard'

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
 *
 * Unpublished results share a card-only link (/s/<id>), created on the first
 * share action, so link previews show the participant's own card. Published
 * results link to their public page.
 */
export function ShareBar({
  caption,
  published,
  publicPath,
  homePath,
  linkPath,
  activeLinks,
  ensureLink,
  onStopSharing,
  downloading,
  disabled,
  onShare,
  onDownload,
  publishControl
}: {
  caption: string
  published: boolean
  /** The public page, when published. */
  publicPath: string
  /** Where links point if a share link cannot be created. */
  homePath: string
  /** The current result's share link page, once it exists. */
  linkPath: string | null
  /** Active share links for any of this assessment's results. */
  activeLinks: number
  /** Creates the share link (or returns it) and resolves to its page. */
  ensureLink: (name: string | null) => Promise<string>
  onStopSharing: () => Promise<void>
  downloading: boolean
  disabled: boolean
  onShare: (target: ShareTarget, kind: LinkKind) => void
  onDownload: () => void
  publishControl?: ReactNode
}) {
  const t = useTranslations('Share')
  const nameId = useId()
  // Web Share exists on phones and some desktops; decide after hydration.
  const [native, setNative] = useState(false)
  const [origin, setOrigin] = useState(siteUrl)
  const [name, setName] = useState('')
  const [stopping, setStopping] = useState(false)
  useEffect(() => {
    queueMicrotask(() => {
      setNative(typeof navigator.share === 'function')
      setOrigin(window.location.origin)
    })
  }, [])
  const kind: LinkKind = published ? 'public' : 'snapshot'
  const ready = published || linkPath !== null
  const nameValid = !name.trim() || sharerNameSchema.safeParse(name).success
  // Links work before the share link exists (pointing home); a click creates
  // it first, so the preview shows the participant's card.
  const href = (path: string) => `${origin}${path}`
  const currentPath = published ? publicPath : (linkPath ?? homePath)
  const resolve = async () => {
    if (published) return href(publicPath)
    if (linkPath) return href(linkPath)
    if (!nameValid) throw new NameError()
    return href(await ensureLink(sharerNameSchema.safeParse(name).data ?? null))
  }
  const failed = (err: unknown) =>
    toast.error(err instanceof NameError ? t('nameInvalid') : t('linkFailed'))
  // Prepare the link as soon as a share button is pressed, so the click that
  // follows usually finds it ready.
  const prepare = () => {
    if (!ready && nameValid) void resolve().catch(() => {})
  }
  const openComposer = (
    event: MouseEvent<HTMLAnchorElement>,
    target: (typeof platforms)[number][0]
  ) => {
    onShare(target, kind)
    if (target === 'linkedin') void copy(caption, t('linkedinCopied'))
    if (ready) return
    // Open the window during the click, then point it at the composer once
    // the link exists; a window opened later would be blocked.
    event.preventDefault()
    const popup = window.open('', '_blank')
    if (popup) popup.opener = null
    void resolve()
      .then((link) => {
        const url = intentUrl(target, caption, shareUrl(link, target))
        if (popup) popup.location.replace(url)
        else window.open(url, '_blank', 'noopener,noreferrer')
      })
      .catch((err: unknown) => {
        popup?.close()
        failed(err)
      })
  }
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
      {!published && !linkPath && (
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor={nameId}>{t('nameLabel')}</Label>
          <Input
            id={nameId}
            value={name}
            maxLength={40}
            autoComplete='given-name'
            aria-invalid={!nameValid}
            aria-describedby={`${nameId}-hint`}
            className='sm:max-w-xs'
            onChange={(event) => setName(event.target.value)}
          />
          <p id={`${nameId}-hint`} className='text-xs text-muted-foreground'>
            {nameValid ? t('nameHint') : t('nameInvalid')}
          </p>
        </div>
      )}
      <div className='flex flex-wrap gap-2'>
        {native && (
          <Button
            type='button'
            className='w-full sm:w-auto'
            disabled={disabled}
            onPointerDown={prepare}
            onClick={() => {
              onShare('native', kind)
              void resolve()
                .then((link) =>
                  navigator
                    .share({ text: caption, url: shareUrl(link, 'native') })
                    .catch((err: unknown) => {
                      // Creating the link can outlast the tap's permission.
                      if (
                        err instanceof Error &&
                        err.name === 'NotAllowedError'
                      )
                        toast(t('shareAgain'))
                      /* Closing the share sheet is not an error. */
                    })
                )
                .catch(failed)
            }}
          >
            <Share2Icon data-icon='inline-start' aria-hidden='true' />
            {t('share')}
          </Button>
        )}
        {platforms.map(([target, label]) => (
          <Button key={target} asChild variant='outline' size='sm'>
            <a
              href={intentUrl(
                target,
                caption,
                shareUrl(href(currentPath), target)
              )}
              target='_blank'
              rel='noopener noreferrer'
              onPointerDown={prepare}
              onClick={(event) => openComposer(event, target)}
            >
              {label ?? t('x')}
            </a>
          </Button>
        ))}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onPointerDown={prepare}
          onClick={() => {
            onShare('copy_link', kind)
            void copyText(
              resolve().then((link) => shareUrl(link, 'copy_link'))
            ).then(
              () => toast.success(t('linkCopied')),
              (err: unknown) =>
                err instanceof NameError || err instanceof ApiError
                  ? failed(err)
                  : toast.error(t('copyFailed'))
            )
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
      {activeLinks > 0 && (
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-body-foreground'>
          <span>{t('linkActive')}</span>
          <Button
            type='button'
            variant='link'
            size='sm'
            className='h-auto px-0'
            disabled={stopping}
            aria-busy={stopping}
            onClick={() => {
              setStopping(true)
              onStopSharing()
                .then(() => toast.success(t('stopped')))
                .catch(() => toast.error(t('stopFailed')))
                .finally(() => setStopping(false))
            }}
          >
            {t('stopSharing')}
          </Button>
        </div>
      )}
      {publishControl && (
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4 text-sm text-body-foreground'>
          {publishControl}
        </div>
      )}
    </section>
  )
}

class NameError extends Error {}
