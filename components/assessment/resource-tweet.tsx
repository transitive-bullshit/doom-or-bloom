'use client'

import { EmbeddedTweet, TweetSkeleton, useTweet } from 'react-tweet'
import { useTheme } from 'next-themes'
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
  const { resolvedTheme } = useTheme()
  if (!isLoading && !data)
    return <ResourceBookmark resource={resource} onOpen={onOpen} />
  return (
    <div
      className='resource-tweet'
      data-theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      onClickCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('a'))
          onOpen?.()
      }}
    >
      {isLoading || !data ? <TweetSkeleton /> : <EmbeddedTweet tweet={data} />}
    </div>
  )
}
