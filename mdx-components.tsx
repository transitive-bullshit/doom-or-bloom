import type { MDXComponents } from 'mdx/types'
import { blogComponents } from '@/components/blog/mdx'

// Required by @next/mdx. Blog posts are the only MDX; see docs/BLOG.md.
export function useMDXComponents(): MDXComponents {
  return blogComponents
}
