'use client'

import { lazy, Suspense } from 'react'
import { tweetIdFromUrl } from '@/lib/sharing/tweet-url'
import { ResourceBookmark } from './resource-bookmark'

const ResourceTweet = lazy(() => import('./resource-tweet'))
type Resource = {
  title: string
  url: string
  question?: string
  summary?: string
}

export function ResourceList<T extends Resource>({
  resources,
  onOpen
}: {
  resources: T[]
  onOpen?: (resource: T) => void
}) {
  const entries = resources.map((resource) => ({
    resource,
    tweetId: tweetIdFromUrl(resource.url)
  }))
  const bookmarks = entries.filter((entry) => !entry.tweetId)
  const tweets = entries.filter((entry) => entry.tweetId)
  return (
    <div className='flex flex-col gap-6'>
      {bookmarks.length > 0 && (
        <div
          data-resource-layout='list'
          className='mx-auto flex w-full max-w-[var(--content-width)] flex-col gap-4'
        >
          {bookmarks.map(({ resource }) => (
            <ResourceBookmark
              key={resource.url}
              resource={resource}
              onOpen={onOpen ? () => onOpen(resource) : undefined}
            />
          ))}
        </div>
      )}
      {tweets.length > 0 && (
        <div
          data-resource-layout='masonry'
          className={
            tweets.length > 1
              ? 'resource-masonry resource-masonry-wide'
              : 'resource-masonry'
          }
        >
          {tweets.map(({ resource, tweetId }) => {
            const open = onOpen ? () => onOpen(resource) : undefined
            return (
              <div key={resource.url} className='resource-item min-w-0'>
                <Suspense
                  fallback={
                    <ResourceBookmark resource={resource} onOpen={open} />
                  }
                >
                  <ResourceTweet
                    id={tweetId!}
                    resource={resource}
                    onOpen={open}
                  />
                </Suspense>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
