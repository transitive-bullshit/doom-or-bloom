import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { postFrontmatterSchema } from './schema'

/**
 * Every page a post cites, for prefetching favicons (`pnpm resources:previews`).
 * It reads the frontmatter directly, so scripts can call it outside the server.
 */
export function blogSourceUrls(
  directory = path.join(process.cwd(), 'content/blog')
) {
  return [
    ...new Set(
      readdirSync(directory)
        .filter((file) => file.endsWith('.mdx'))
        .flatMap((file) => {
          const { data } = matter(
            readFileSync(path.join(directory, file), 'utf8')
          )
          const { sources = {} } = postFrontmatterSchema.parse(data)
          return Object.values(sources).map(({ url }) => url)
        })
    )
  ]
}
