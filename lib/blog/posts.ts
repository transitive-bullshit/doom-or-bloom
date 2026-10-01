import 'server-only'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { siteCreator } from '@/lib/site'
import {
  countWords,
  postFrontmatterSchema,
  postSlugPattern,
  readingMinutes,
  type PostFrontmatter
} from './schema'

export type BlogPost = PostFrontmatter & {
  slug: string
  author: string
  authorUrl: string
  words: number
  minutes: number
}

// Posts are content/blog/<slug>.mdx. Pages render each file through @next/mdx;
// this reads their frontmatter for the index, metadata, feeds and sitemap.
// next.config.ts traces the directory into routes that regenerate at runtime.
export const blogDirectory = path.join(process.cwd(), 'content/blog')

function readPost(file: string): BlogPost {
  const slug = file.slice(0, -'.mdx'.length)
  if (!postSlugPattern.test(slug))
    throw new Error(`Blog post file names are lowercase slugs: ${file}`)
  const { data, content } = matter(
    readFileSync(path.join(blogDirectory, file), 'utf8')
  )
  const parsed = postFrontmatterSchema.safeParse(data)
  if (!parsed.success)
    throw new Error(`Invalid frontmatter in ${file}: ${parsed.error.message}`)
  const words = countWords(content)
  return {
    ...parsed.data,
    slug,
    author: siteCreator.name,
    authorUrl: siteCreator.url,
    words,
    minutes: readingMinutes(words)
  }
}

const readPosts = () =>
  readdirSync(blogDirectory)
    .filter((file) => file.endsWith('.mdx'))
    .map(readPost)
    .toSorted(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
    )
let posts: BlogPost[] | undefined

/**
 * Every post, newest first. Production reads them once: posts change only
 * with a deployment. Development rereads them so edits show on reload.
 */
export function blogPosts(): BlogPost[] {
  if (process.env.NODE_ENV !== 'production') return readPosts()
  return (posts ??= readPosts())
}

export function blogPost(slug: string) {
  return blogPosts().find((post) => post.slug === slug) ?? null
}
