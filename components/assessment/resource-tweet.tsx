'use client'

import { EmbeddedTweet, TweetSkeleton, useTweet } from 'react-tweet'
import { ResourceBookmark } from './resource-bookmark'

export default function ResourceTweet({
  id,
  resource,
  onOpen
}: {
  id: string
  resource: { title: string; url: string; question?: string; summary?: string }
  onOpen?: () => void
}) {
  const { data, isLoading } = useTweet(id, `/api/tweet?id=${id}`)
  if (!isLoading && !data)
    return <ResourceBookmark resource={resource} onOpen={onOpen} />
  // react-tweet themes itself from the `light`/`dark` class next-themes sets on
  // <html> before paint, so the markup stays identical on server and client.
  return (
    <div
      className='resource-tweet'
      onClickCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('a'))
          onOpen?.()
      }}
    >
      {isLoading || !data ? <TweetSkeleton /> : <EmbeddedTweet tweet={data} />}
    </div>
  )
}
