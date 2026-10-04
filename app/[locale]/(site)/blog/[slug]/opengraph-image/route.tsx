import { defaultLocale, isLocale, locales } from '@/i18n/config'
import { blogPosts, isTranslated } from '@/lib/blog/posts'
import { blogSocialImageResponse } from '@/lib/sharing/blog-social-card'

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
  if (!isLocale(locale) || locale === defaultLocale)
    return new Response(null, { status: 404 })
  return blogSocialImageResponse(slug, locale)
}
