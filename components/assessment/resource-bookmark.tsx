import Image from 'next/image'
import { FadeText } from './fade-text'
import { GlobeIcon } from 'lucide-react'
import previews from '@/lib/sharing/resource-previews.json'

export function ResourceBookmark({
  resource,
  onOpen
}: {
  resource: { title: string; url: string; question?: string }
  onOpen?: () => void
}) {
  const preview = (
    previews as Record<
      string,
      { image?: string; icon?: string; description?: string | null }
    >
  )[resource.url]
  const description = preview?.description || resource.question
  const hostname = new URL(resource.url).hostname.replace(/^www\./, '')
  return (
    <a
      href={resource.url}
      target='_blank'
      rel='noreferrer'
      onClick={onOpen}
      className='group flex min-h-32 overflow-hidden rounded-xl border bg-card text-card-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
    >
      <div className='flex min-w-0 flex-1 flex-col justify-between gap-3 p-4'>
        <div>
          <h3 className='text-sm leading-snug font-medium'>
            <FadeText lines={2}>{resource.title}</FadeText>
          </h3>
          {description && (
            <p className='mt-2 text-xs leading-relaxed text-body-foreground'>
              <FadeText lines={3}>{description}</FadeText>
            </p>
          )}
        </div>
        <span className='flex items-center gap-2 text-xs text-muted-foreground'>
          {preview?.icon ? (
            <Image
              src={preview.icon}
              width={16}
              height={16}
              alt=''
              unoptimized
              className='size-4 shrink-0 object-contain'
            />
          ) : (
            <GlobeIcon className='size-4 shrink-0' />
          )}
          <span className='truncate'>{hostname}</span>
        </span>
      </div>
      {(preview?.image || preview?.icon) && (
        <div className='bookmark-image relative w-28 shrink-0 sm:w-44'>
          <Image
            src={preview.image ?? preview.icon!}
            alt=''
            fill
            unoptimized
            className={
              preview.image ? 'object-cover' : 'bg-muted p-8 object-contain'
            }
          />
        </div>
      )}
    </a>
  )
}
