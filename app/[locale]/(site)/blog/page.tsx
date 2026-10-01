import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale, languageTag } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { publicPageMetadata } from '@/lib/metadata'
import { blogPosts } from '@/lib/blog/posts'
import { postDate } from '@/lib/blog/format'
import { blogJsonLd } from '@/lib/seo/json-ld'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'

// Posts are English and change only with a deployment. Other locales translate
// the chrome and defer to the English index in search (see docs/BLOG.md).
export const dynamic = 'error'
export function generateMetadata() {
  return publicPageMetadata('blog', { feed: true })
}

export default async function Page() {
  const [locale, t, pages] = await Promise.all([
    getLocale(),
    getTranslations('Blog'),
    getTranslations('Pages')
  ])
  const tag = languageTag(locale)
  const posts = blogPosts()
  return (
    <>
      <JsonLd
        data={blogJsonLd({
          name: 'Doom or Bloom blog',
          description: pages('blog.description'),
          posts
        })}
      />
      <div className='content-column flex flex-col gap-10 py-14 text-base leading-relaxed'>
        <BreadcrumbJsonLd path='/blog' />
        <header className='flex flex-col gap-3'>
          <h1>{t('title')}</h1>
          <p className='text-body-foreground'>{t('intro')}</p>
          {locale !== defaultLocale && (
            <p className='text-sm text-muted-foreground'>{t('englishOnly')}</p>
          )}
        </header>
        <ol className='flex flex-col gap-10'>
          {posts.map((post) => (
            <li key={post.slug}>
              <article className='flex flex-col gap-2'>
                <h2 lang='en'>
                  <Link
                    href={`/blog/${post.slug}`}
                    className='underline-offset-4 hover:underline'
                  >
                    {post.title}
                  </Link>
                </h2>
                <p lang='en' className='text-body-foreground'>
                  {post.description}
                </p>
                <p className='text-sm text-muted-foreground'>
                  <time dateTime={post.date}>{postDate(post.date, tag)}</time>
                  {' · '}
                  {t('readingTime', { minutes: post.minutes })}
                </p>
              </article>
            </li>
          ))}
        </ol>
        <p className='text-sm'>
          <a
            href='/blog/rss.xml'
            type='application/rss+xml'
            className='underline underline-offset-4'
          >
            {t('rss')}
          </a>
        </p>
      </div>
    </>
  )
}
