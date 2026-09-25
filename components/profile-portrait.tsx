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
          // Match the landing map so navigation reuses its cached portrait.
          width={40}
          height={40}
          sizes='(max-width: 520px) 30px, 40px'
          quality={90}
          loading='eager'
          className='absolute inset-0 size-full object-cover'
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={80}
        height={80}
        sizes='(min-width: 640px) 80px, 64px'
        quality={90}
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
