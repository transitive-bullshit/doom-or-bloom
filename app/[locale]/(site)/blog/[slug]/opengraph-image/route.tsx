import { defaultLocale, isLocale, languageTag, locales } from '@/i18n/config'
import { translatorFor } from '@/i18n/translators'
import {
  blogPost,
  blogPosts,
  isTranslated,
  postTranslation
} from '@/lib/blog/posts'
import { postDate } from '@/lib/blog/format'
import { publicImageCacheHeaders } from '@/lib/sharing/image-cache'
import { renderBlogSocialImage } from '@/lib/sharing/blog-social-card'

// A translated post's social card, in its language: /<code>/blog/<slug>/
// opengraph-image. English cards are app/blog/[slug]/opengraph-image. Posts
// change only with a deployment, so every card renders at build. Layouts don't
// wrap route handlers, so this lists the locale with each post.
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  const translated = blogPosts().filter((post) => isTranslated(post.slug))
  return locales
    .filter((locale) => locale !== defaultLocale)
    .flatMap((locale) => translated.map(({ slug }) => ({ locale, slug })))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params
  const post = blogPost(slug)
  if (!post || !isLocale(locale)) return new Response(null, { status: 404 })
  const { title, minutes } = postTranslation(slug, locale) ?? post
  const t = await translatorFor(locale)
  const image = await renderBlogSocialImage({
    title,
    meta: `${postDate(post.date, languageTag(locale))} · ${t('Blog.readingTime', { minutes })}`,
    label: t('Blog.title'),
    locale
  })
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png', ...publicImageCacheHeaders }
  })
}
