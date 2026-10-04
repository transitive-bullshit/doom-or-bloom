import { defaultLocale } from '@/i18n/config'
import { blogPosts } from '@/lib/blog/posts'
import { blogSocialImageResponse } from '@/lib/sharing/blog-social-card'

// Outside app/[locale] at its published URL, like profile previews. Posts
// change only with a deployment, so every card renders at build. Translated
// cards are app/[locale]/(site)/blog/[slug]/opengraph-image.
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return blogPosts().map(({ slug }) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return blogSocialImageResponse((await params).slug, defaultLocale)
}
