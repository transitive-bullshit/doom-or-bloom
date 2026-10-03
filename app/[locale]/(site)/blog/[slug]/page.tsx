import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale, languageTag } from '@/i18n/config'
import { pageMetadata } from '@/lib/metadata'
import { blogPost, blogPosts, postTranslation } from '@/lib/blog/posts'
import { postDate } from '@/lib/blog/format'
import { breadcrumbTrail } from '@/lib/breadcrumbs'
import { articleJsonLd } from '@/lib/seo/json-ld'
import { profileMentions } from '@/lib/personas/mentions'
import { blogCardPath } from '@/lib/sharing/blog-social-card'
import { loadProfileNames } from '@/components/landing/data'
import { chartText } from '@/components/blog/chart-parts'
import { postComponents } from '@/components/blog/mdx'
import { BreadcrumbTrail } from '@/components/breadcrumb-trail'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'

// Every post renders at build in every locale; unknown slugs are 404s. A
// translated post renders its translation in each locale, canonicalizes to
// itself and lists its languages. Other posts stay English under translated
// chrome, noindex outside English (docs/BLOG.md#languages). Names link to the
// profiles published when the post was built.
export const dynamic = 'error'
export const dynamicParams = false
export function generateStaticParams() {
  return blogPosts().map(({ slug }) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }
type Post = ComponentType<{ components?: MDXComponents }>

/** The post as this locale reads it: its translation, or the English. */
async function localizedPost(slug: string) {
  const post = blogPost(slug)
  if (!post) notFound()
  const locale = await getLocale()
  const translation = postTranslation(slug, locale)
  return {
    post: { ...post, ...translation },
    locale,
    contentLocale: translation ? locale : defaultLocale,
    translated: Boolean(translation)
  }
}

export async function generateMetadata({ params }: Props) {
  const { post, locale, translated } = await localizedPost((await params).slug)
  return pageMetadata({
    locale,
    translated,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    image: blogCardPath(post, translated ? locale : defaultLocale),
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
  const { post, locale, contentLocale, translated } = await localizedPost(
    (await params).slug
  )
  const [{ default: Post }, t, charts, map, crumbs, profiles] =
    await Promise.all([
      (translated
        ? import(`@/content/l10n/${contentLocale}/blog/${post.slug}.mdx`)
        : import(`@/content/blog/${post.slug}.mdx`)) as Promise<{
        default: Post
      }>,
      getTranslations('Blog'),
      getTranslations({ locale: contentLocale, namespace: 'BlogCharts' }),
      getTranslations({ locale: contentLocale, namespace: 'Map' }),
      getTranslations('Breadcrumbs'),
      loadProfileNames()
    ])
  const tag = languageTag(locale)
  const contentTag = languageTag(contentLocale)
  const path = `/blog/${post.slug}`
  const image = blogCardPath(post, contentLocale)
  return (
    <>
      <BreadcrumbTrail
        trail={breadcrumbTrail(path, crumbs, post.title)!}
        ariaLabel={crumbs('label')}
      />
      <article className='content-column flex flex-col gap-8 py-14 text-base leading-relaxed'>
        <JsonLd
          data={articleJsonLd({
            ...post,
            image,
            locale: contentLocale
          })}
        />
        <BreadcrumbJsonLd path={path} title={post.title} />
        <header className='flex flex-col gap-3'>
          <h1 lang={contentTag}>{post.title}</h1>
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
          {contentLocale !== locale && (
            <p className='text-sm text-muted-foreground'>{t('englishOnly')}</p>
          )}
        </header>
        <div
          lang={contentTag}
          data-slot='blog-post-body'
          className='flex flex-col gap-5 [&>h2]:mt-6 [&>h2]:-mb-1 [&>h3]:mt-2'
        >
          <Post
            components={postComponents({
              mention: profileMentions(profiles),
              text: chartText(charts, map, contentTag)
            })}
          />
        </div>
      </article>
      <div className='content-column pb-14'>
        <WorldviewCtaCard />
      </div>
    </>
  )
}
