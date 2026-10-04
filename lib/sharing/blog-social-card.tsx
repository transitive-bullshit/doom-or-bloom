import { createHash } from 'node:crypto'
import type { CSSProperties } from 'react'
import { render } from 'takumi-js'
import { fromJsx } from 'takumi-js/helpers/jsx'
import {
  defaultLocale,
  languageTag,
  localizedPath,
  type Locale
} from '@/i18n/config'
import { translatorFor } from '@/i18n/translators'
import { PrismField } from '@/components/worldview/prism-field'
import { postDate } from '@/lib/blog/format'
import { blogPost, postTranslation } from '@/lib/blog/posts'
import { interTightRenderOptions, wrappable } from './card-renderer'
import { publicImageCacheHeaders } from './image-cache'
import { BrandMark } from './site-social-card'

/**
 * A blog post's social image: the post's header (breadcrumb, title and byline)
 * on a page laid over the landing map's Prism field. Every post gets one from
 * its frontmatter, rendered by Takumi at build.
 */

/** Bump when the card design or its labels change, so networks refetch it. */
const blogCardRevision = 2

/**
 * The versioned image URL a post advertises. A translated post's card is in
 * its language, under the locale prefix.
 */
export function blogCardPath(
  post: {
    slug: string
    title: string
    author: string
    date: string
    minutes: number
  },
  locale: Locale = defaultLocale
) {
  const version = createHash('sha256')
    .update(
      [blogCardRevision, post.title, post.author, post.date, post.minutes].join(
        '\n'
      )
    )
    .digest('hex')
    .slice(0, 10)
  return `${localizedPath(`/blog/${post.slug}`, locale)}/opengraph-image?v=${version}`
}

const width = 1200
const height = 630
// The light theme's page tokens (app/globals.css) and the Prism field's.
const colors = { page: '#fafaf9', text: '#181611', muted: '#605d57' }
const prism = {
  coral: '#ff786a',
  peach: '#ffb88b',
  lime: '#e6ff80',
  mint: '#aaffbd',
  violet: '#bcb1ff',
  veilOpacity: 0.5,
  // The map's midpoint axes show only in the frame around the page.
  grid: '#25392b30',
  border: 'transparent'
}
const inset = 40
const padding = { top: 48, right: 60, bottom: 52, left: 60 }
const titleWidth = width - 2 * inset - padding.left - padding.right
// Two lines at the largest size, three below it; four for the longest titles.
const titleHeight = 300
const titleSizes = [100, 92, 84, 76, 68, 60, 54, 48]

// Latin titles take the display tracking of the site's hero. Negative tracking
// crowds Han and kana, and stacked Thai and Devanagari marks need taller lines.
const titleType = (locale: Locale) =>
  ['hi', 'th'].includes(locale)
    ? { lineHeight: 1.32, tracking: 0 }
    : ['ja', 'zh'].includes(locale)
      ? { lineHeight: 1.2, tracking: 0 }
      : { lineHeight: 1.06, tracking: -0.03 }

/** A title's size, and the lines it is cut to when even the smallest overflows. */
type TitleFit = { fontSize: number; maxLines?: number }

function titleStyle(
  locale: Locale,
  { fontSize, maxLines }: TitleFit
): CSSProperties {
  const { lineHeight, tracking } = titleType(locale)
  return {
    width: titleWidth,
    fontSize,
    fontWeight: 600,
    lineHeight,
    letterSpacing: tracking * fontSize,
    textWrap: 'balance',
    ...(maxLines && {
      overflowWrap: 'anywhere',
      lineClamp: maxLines,
      textOverflow: 'ellipsis'
    })
  }
}

/**
 * The largest size at which the title's lines fit its box, as Takumi sets
 * them: no taller than the box, and no word wider than it. Past the smallest
 * size, words break anywhere and the title ends in an ellipsis, so it never
 * overlaps the byline. `lib/blog/blog.test.ts` checks every post's title fits
 * before that.
 */
export async function fitTitle(
  title: string,
  locale: Locale
): Promise<TitleFit> {
  const options = await interTightRenderOptions(locale)
  for (const fontSize of titleSizes) {
    const { node } = await fromJsx(
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={titleStyle(locale, { fontSize })}>{title}</div>
      </div>
    )
    const [box] = (
      await options.renderer.measure(node, {
        width,
        height,
        lang: options.lang,
        fontFamilies: options.fontFamilies
      })
    ).children
    if (
      box!.height <= titleHeight &&
      box!.runs.every((run) => run.x + run.width <= titleWidth + 0.5)
    )
      return { fontSize }
  }
  const fontSize = titleSizes.at(-1)!
  return {
    fontSize,
    maxLines: Math.floor(
      titleHeight / (fontSize * titleType(locale).lineHeight)
    )
  }
}

function Chevron() {
  return (
    <svg width={22} height={22} viewBox='0 0 24 24'>
      <path
        d='m9 18 6-6-6-6'
        fill='none'
        stroke={colors.muted}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function BlogSocialCard({
  title,
  fit,
  meta,
  label,
  locale
}: {
  title: string
  fit: TitleFit
  /** Byline, date and reading time, e.g. "By … · October 1, 2026 · 5 min read". */
  meta: string
  /** "Blog", in the card's language. */
  label: string
  locale: Locale
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width,
        height,
        color: colors.text,
        fontFamily: 'Inter Tight'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <PrismField
          id='blog-card'
          plot={{ left: 0, top: 0, width, height }}
          radius={0}
          colors={prism}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: inset,
          top: inset,
          width: width - 2 * inset,
          height: height - 2 * inset,
          display: 'flex',
          flexDirection: 'column',
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          borderRadius: 24,
          backgroundColor: colors.page,
          boxShadow: '0 8px 32px rgb(40 30 20 / 0.12)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 34,
            fontSize: 26,
            fontWeight: 600
          }}
        >
          <BrandMark size={32} />
          <span>Doom or Bloom</span>
          <Chevron />
          <span style={{ color: colors.muted, fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div style={titleStyle(locale, fit)}>{title}</div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            fontSize: 26,
            fontWeight: 500,
            color: colors.muted
          }}
        >
          {meta}
        </div>
      </div>
    </div>
  )
}

/**
 * Inter Tight in every language; Hindi, Thai, Chinese and Japanese letters
 * fall back to the share cards' Noto subsets (lib/sharing/card-fonts.ts).
 */
export async function renderBlogSocialImage({
  title,
  meta,
  label = 'Blog',
  locale = defaultLocale
}: {
  title: string
  meta: string
  label?: string
  locale?: Locale
}) {
  const text = wrappable(title, locale)
  return render(
    BlogSocialCard({
      title: text,
      fit: await fitTitle(text, locale),
      meta,
      label,
      locale
    }),
    {
      width,
      height,
      format: 'png',
      ...(await interTightRenderOptions(locale)),
      signal: AbortSignal.timeout(10_000)
    }
  )
}

/**
 * The opengraph-image route response for a post in a locale: its translation's
 * card, or the English card. Unknown posts and untranslated locales are 404s.
 */
export async function blogSocialImageResponse(slug: string, locale: Locale) {
  const post = blogPost(slug)
  const translation = postTranslation(slug, locale)
  if (!post || (locale !== defaultLocale && !translation))
    return new Response(null, { status: 404 })
  const { title, minutes } = translation ?? post
  const t = await translatorFor(locale)
  const image = await renderBlogSocialImage({
    title,
    meta: [
      t('Blog.by', { author: post.author }),
      postDate(post.date, languageTag(locale)),
      t('Blog.readingTime', { minutes })
    ].join(' · '),
    label: t('Blog.title'),
    locale
  })
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png', ...publicImageCacheHeaders }
  })
}
