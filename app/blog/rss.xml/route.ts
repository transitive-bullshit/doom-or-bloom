import { englishTranslator } from '@/i18n/translators'
import { blogPosts } from '@/lib/blog/posts'
import { blogFeed } from '@/lib/blog/rss'

// English, like the posts. Generated at build: posts change with a deployment.
export const dynamic = 'force-static'

export function GET() {
  const t = englishTranslator('Pages')
  return new Response(
    blogFeed({
      title: 'Doom or Bloom blog',
      description: t('blog.description'),
      posts: blogPosts()
    }),
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
  )
}
