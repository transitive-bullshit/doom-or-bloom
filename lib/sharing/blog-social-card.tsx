import { createHash } from 'node:crypto'
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
  post: { slug: string; title: string; date: string; minutes: number },
  locale: Locale = defaultLocale
) {
  const version = createHash('sha256')
    .update([blogCardRevision, post.title, post.date, post.minutes].join('\n'))
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
function titleStyle(locale: Locale, fontSize: number) {
  return {
    width: titleWidth,
    fontSize,
    fontWeight: 600,
    textWrap: 'balance',
    ...(['hi', 'th'].includes(locale)
      ? { lineHeight: 1.32 }
      : ['ja', 'zh'].includes(locale)
        ? { lineHeight: 1.2 }
        : { lineHeight: 1.06, letterSpacing: -0.03 * fontSize })
  } as const
}

/** The largest title size whose lines fit the title's box, as Takumi sets them. */
async function titleSize(title: string, locale: Locale) {
  const options = await interTightRenderOptions(locale)
  for (const size of titleSizes) {
    const { node } = await fromJsx(
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={titleStyle(locale, size)}>{title}</div>
      </div>
    )
    const measured = await options.renderer.measure(node, {
      width,
      height,
      lang: options.lang,
      fontFamilies: options.fontFamilies
    })
    if (measured.children[0]!.height <= titleHeight) return size
  }
  return titleSizes.at(-1)!
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
  titleSize,
  meta,
  label,
  locale
}: {
  title: string
  titleSize: number
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
          <div style={titleStyle(locale, titleSize)}>{title}</div>
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
      titleSize: await titleSize(text, locale),
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
