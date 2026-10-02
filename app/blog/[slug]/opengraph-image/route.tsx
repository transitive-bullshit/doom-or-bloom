import { englishTranslator } from '@/i18n/translators'
import { blogPost, blogPosts } from '@/lib/blog/posts'
import { postMeta } from '@/lib/blog/format'
import { publicImageCacheHeaders } from '@/lib/sharing/image-cache'
import { renderBlogSocialImage } from '@/lib/sharing/blog-social-card'

// Outside app/[locale] at its published URL, like profile previews. Posts are
// English and change only with a deployment, so every card renders at build.
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
  const post = blogPost((await params).slug)
  if (!post) return new Response(null, { status: 404 })
  const image = await renderBlogSocialImage({
    title: post.title,
    meta: postMeta(englishTranslator('Blog'), 'en', post)
  })
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png', ...publicImageCacheHeaders }
  })
}
