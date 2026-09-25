'use client'

import Image from 'next/image'
import { useState } from 'react'

export function ProfilePortrait({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span
      data-slot='profile-portrait'
      className='image-outline relative block size-16 shrink-0 overflow-hidden rounded-full sm:size-20'
    >
      {!loaded && (
        <Image
          src={src}
          alt=''
          aria-hidden='true'
          // Match both maps' srcSet so navigation reuses their cached portrait.
          width={40}
          height={40}
          loading='eager'
          className='absolute inset-0 size-full object-cover'
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={80}
        height={80}
        loading='eager'
        fetchPriority='high'
        // Next calls onLoad after decoding, including browser-cache hits.
        onLoad={() => setLoaded(true)}
        className='size-full object-cover'
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </span>
  )
}
