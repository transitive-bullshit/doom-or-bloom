import { createHash } from 'node:crypto'
import { render } from 'takumi-js'
import { PrismField } from '@/components/worldview/prism-field'
import { siteRenderer } from './render-site-social'
import { BrandMark, siteCardColors as colors } from './site-social-card'

/**
 * A blog post's social image, in the site card's style: the title beside the
 * Prism field. Rendered by Takumi at build time.
 */

/** Bump when the card design changes, so social networks refetch it. */
const blogCardRevision = 1

/** The versioned image URL a post advertises. */
export function blogCardPath(post: { slug: string; title: string }) {
  const version = createHash('sha256')
    .update(`${blogCardRevision}\n${post.title}`)
    .digest('hex')
    .slice(0, 10)
  return `/blog/${post.slug}/opengraph-image?v=${version}`
}

// Shorter titles get the site card's display size; longer ones step down.
function blogTitleSize(title: string) {
  if (title.length <= 24) return 76
  if (title.length <= 48) return 60
  if (title.length <= 80) return 48
  return 40
}

const field = { left: 640, top: 96, width: 480, height: 400 }

function BlogSocialCard({
  title,
  meta
}: {
  title: string
  /** Date and reading time, e.g. "October 1, 2026 · 5 min read". */
  meta: string
}) {
  const panel = {
    left: field.left - 40,
    top: field.top - 40,
    width: field.width + 80,
    height: field.height + 80
  }
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: 1200,
        height: 630,
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: 'Inter Tight'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 66,
          top: 72,
          fontSize: 22,
          fontWeight: 500,
          color: colors.muted
        }}
      >
        Blog
      </div>
      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 130,
          width: 500,
          height: 360,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24
        }}
      >
        <div
          style={{
            fontSize: blogTitleSize(title),
            lineHeight: 1.04,
            fontWeight: 500,
            letterSpacing: -2
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 22, color: colors.muted }}>{meta}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 66,
          top: 560,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 17,
          fontWeight: 500,
          color: colors.muted
        }}
      >
        <BrandMark />
        <span>Doom or Bloom</span>
      </div>
      <div
        style={{
          position: 'absolute',
          ...panel,
          borderRadius: 18,
          backgroundColor: colors.panel
        }}
      />
      <svg
        width={panel.width}
        height={panel.height}
        viewBox={`${panel.left} ${panel.top} ${panel.width} ${panel.height}`}
        style={{ position: 'absolute', left: panel.left, top: panel.top }}
      >
        <PrismField
          id='blog-card'
          plot={field}
          radius={12}
          colors={{
            coral: '#ff786a',
            peach: '#ffb88b',
            lime: '#e6ff80',
            mint: '#aaffbd',
            violet: '#bcb1ff',
            veilOpacity: 0.5,
            grid: '#25392b35',
            border: '#25392b22'
          }}
        />
        <text
          x={field.left + 18}
          y={field.top + field.height / 2 - 12}
          fill={colors.text}
          fontSize='20'
          fontWeight='600'
        >
          Doom
        </text>
        <text
          x={field.left + field.width - 18}
          y={field.top + field.height / 2 - 12}
          textAnchor='end'
          fill={colors.text}
          fontSize='20'
          fontWeight='600'
        >
          Bloom
        </text>
      </svg>
    </div>
  )
}

export async function renderBlogSocialImage(post: {
  title: string
  meta: string
}) {
  return render(BlogSocialCard(post), {
    width: 1200,
    height: 630,
    format: 'png',
    renderer: await siteRenderer(),
    signal: AbortSignal.timeout(10_000)
  })
}
