import 'server-only'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { defaultLocale, languageTag, locales, type Locale } from '@/i18n/config'
import { siteCreator } from '@/lib/site'
import { headingIds } from './headings'
import { blogL10nDirectory, translatedFrontmatterSchema } from './l10n'
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

export type PostTranslation = {
  title: string
  description: string
  words: number
  minutes: number
}

// Translations are content/l10n/<locale>/blog/<slug>.mdx (lib/blog/l10n.ts).
// `pnpm test:content` checks they are complete and current.
function readTranslation(slug: string, locale: string): PostTranslation | null {
  const file = path.join(
    process.cwd(),
    blogL10nDirectory(locale),
    `${slug}.mdx`
  )
  if (!existsSync(file)) return null
  const { data, content } = matter(readFileSync(file, 'utf8'))
  const parsed = translatedFrontmatterSchema.safeParse(data)
  if (!parsed.success)
    throw new Error(
      `Invalid frontmatter in ${locale}/${slug}.mdx: ${parsed.error.message}`
    )
  const words = countWords(content, languageTag(locale as Locale))
  return { ...parsed.data, words, minutes: readingMinutes(words) }
}

const translations = new Map<string, PostTranslation | null>()

/** A post in another language, or null when it is English only. */
export function postTranslation(
  slug: string,
  locale: string
): PostTranslation | null {
  if (locale === defaultLocale) return null
  if (process.env.NODE_ENV !== 'production')
    return readTranslation(slug, locale)
  const key = `${locale}/${slug}`
  if (!translations.has(key))
    translations.set(key, readTranslation(slug, locale))
  return translations.get(key)!
}

/** Whether a post is translated (into every enabled locale). */
export const isTranslated = (slug: string) =>
  locales.some((locale) => postTranslation(slug, locale) !== null)

const postBody = (file: string) => matter(readFileSync(file, 'utf8')).content

/**
 * Section ids for the headings of a post as `locale` reads it, keyed by their
 * text with one id per occurrence: the English heading ids, in every language
 * (lib/blog/headings.ts).
 */
export function postHeadingIds(slug: string, locale: string) {
  const english = postBody(path.join(blogDirectory, `${slug}.mdx`))
  const translation = path.join(
    process.cwd(),
    blogL10nDirectory(locale),
    `${slug}.mdx`
  )
  return locale !== defaultLocale && existsSync(translation)
    ? headingIds(postBody(translation), english)
    : headingIds(english)
}
