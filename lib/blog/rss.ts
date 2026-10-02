import { siteUrl } from '@/lib/site'
import type { BlogPost } from './posts'

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const rfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString()

/** An RSS 2.0 feed of post summaries, newest first. */
export function blogFeed({
  title,
  description,
  posts
}: {
  title: string
  description: string
  posts: readonly Pick<
    BlogPost,
    'slug' | 'title' | 'description' | 'date' | 'author'
  >[]
}) {
  const blog = `${siteUrl}/blog`
  const items = posts.map((post) => {
    const url = `${blog}/${post.slug}`
    return [
      '    <item>',
      `      <title>${escape(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      `      <dc:creator>${escape(post.author)}</dc:creator>`,
      `      <description>${escape(post.description)}</description>`,
      '    </item>'
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escape(title)}</title>`,
    `    <link>${blog}</link>`,
    `    <description>${escape(description)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${blog}/rss.xml" rel="self" type="application/rss+xml"/>`,
    // The newest post, so the feed only changes when its content does.
    ...(posts[0]
      ? [`    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>`]
      : []),
    ...items,
    '  </channel>',
    '</rss>',
    ''
  ].join('\n')
}
