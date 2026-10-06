/**
 * Posts the site footer features on every page, in order. Pick the few that
 * best introduce the site rather than the newest. Each label is a key under
 * `Footer.posts` in the message catalogs, set to the post's title in that
 * language; an English-only post keeps its English title everywhere.
 */
export const footerPosts = [
  { slug: 'hacker-news-vs-x', label: 'hackerNewsVsX', translated: true },
  {
    slug: 'why-polls-on-ai-disagree',
    label: 'whyPollsDisagree',
    translated: false
  }
] as const
