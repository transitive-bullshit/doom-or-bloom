import type { ComponentType } from 'react'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale, languageTag } from '@/i18n/config'
import { pageMetadata } from '@/lib/metadata'
import { blogPost, blogPosts } from '@/lib/blog/posts'
import { postDate } from '@/lib/blog/format'
import { breadcrumbTrail } from '@/lib/breadcrumbs'
import { articleJsonLd } from '@/lib/seo/json-ld'
import { blogCardPath } from '@/lib/sharing/blog-social-card'
import { BreadcrumbTrail } from '@/components/breadcrumb-trail'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'

// Every post renders at build in every locale; unknown slugs are 404s. The
// post body is English everywhere: other locales translate the chrome, are
// noindex and canonicalize to the English post (see docs/BLOG.md).
export const dynamic = 'error'
export const dynamicParams = false
export function generateStaticParams() {
  return blogPosts().map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const post = blogPost((await params).slug)
  if (!post) notFound()
  return pageMetadata({
    locale: await getLocale(),
    translated: false,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    image: blogCardPath(post),
    imageAlt: post.title,
    article: {
      publishedTime: post.date,
      ...(post.updated && { modifiedTime: post.updated }),
      authors: [post.authorUrl]
    },
    feed: true
  })
}

export default async function Page({ params }: Props) {
  const post = blogPost((await params).slug)
  if (!post) notFound()
  const [{ default: Post }, locale, t, crumbs] = await Promise.all([
    import(`@/content/blog/${post.slug}.mdx`) as Promise<{
      default: ComponentType
    }>,
    getLocale(),
    getTranslations('Blog'),
    getTranslations('Breadcrumbs')
  ])
  const tag = languageTag(locale)
  const path = `/blog/${post.slug}`
  return (
    <>
      <BreadcrumbTrail
        trail={breadcrumbTrail(path, crumbs, post.title)!}
        ariaLabel={crumbs('label')}
      />
      <article className='content-column flex flex-col gap-8 py-14 text-base leading-relaxed'>
        <JsonLd data={articleJsonLd({ ...post, image: blogCardPath(post) })} />
        <BreadcrumbJsonLd path={path} title={post.title} />
        <header className='flex flex-col gap-3'>
          <h1 lang='en'>{post.title}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('by', { author: post.author })}
            {' · '}
            <time dateTime={post.date}>{postDate(post.date, tag)}</time>
            {' · '}
            {t('readingTime', { minutes: post.minutes })}
            {post.updated && (
              <>
                {' · '}
                <time dateTime={post.updated}>
                  {t('updated', { date: postDate(post.updated, tag) })}
                </time>
              </>
            )}
          </p>
          {locale !== defaultLocale && (
            <p className='text-sm text-muted-foreground'>{t('englishOnly')}</p>
          )}
        </header>
        <div
          lang='en'
          data-slot='blog-post-body'
          className='flex flex-col gap-5 [&>h2]:mt-6 [&>h2]:-mb-1 [&>h3]:mt-2'
        >
          <Post />
        </div>
      </article>
      <div className='content-column pb-14'>
        <WorldviewCtaCard />
      </div>
    </>
  )
}
