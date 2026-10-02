import { Children, type ComponentProps, type ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Link } from '@/i18n/navigation'
import { pdoomDefinition } from '@/lib/p-doom/copy'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import { DataMap } from './data-map'
import { DataRanges } from './data-ranges'

// Elements and components every post can use. Pages lay posts out in the
// shared reading column; these add only element-level styling.

function Anchor({ href = '', children, ...props }: ComponentProps<'a'>) {
  const className = 'underline underline-offset-4'
  // Site links keep the reader's language prefix; others open separately.
  if (href.startsWith('/'))
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  return (
    <a
      {...props}
      href={href}
      target='_blank'
      rel='noreferrer'
      className={className}
    >
      {children}
    </a>
  )
}

/** The quotable definition the P(doom) hub opens with. */
function Definition() {
  return (
    <p className='border-l-2 border-coral pl-4 text-lg leading-relaxed font-medium'>
      {pdoomDefinition}
    </p>
  )
}

export const blogComponents = {
  a: Anchor,
  ul: (props) => (
    <ul className='flex list-disc flex-col gap-2 pl-6' {...props} />
  ),
  ol: (props) => (
    <ol className='flex list-decimal flex-col gap-2 pl-6' {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className='border-l-2 border-coral pl-4 text-body-foreground italic'
      {...props}
    />
  ),
  hr: () => <hr className='my-4' />,
  DataMap,
  DataRanges,
  Definition
} satisfies MDXComponents

/**
 * Links people with a published profile: the first mention of each in a
 * paragraph, list item or table cell, and every name in a chart. Text inside
 * headings, links and emphasis stays as written.
 */
export function profileLinkComponents(mention: ProfileMentions): MDXComponents {
  const linkNames = (children: ReactNode) => {
    const linked = new Set<string>()
    return Children.map(children, (child) =>
      typeof child === 'string' ? (
        <MentionText parts={mention(child, linked)} />
      ) : (
        child
      )
    )
  }
  return {
    p: ({ children, ...props }) => <p {...props}>{linkNames(children)}</p>,
    li: ({ children, ...props }) => <li {...props}>{linkNames(children)}</li>,
    td: ({ children, ...props }) => <td {...props}>{linkNames(children)}</td>,
    DataRanges: (props: ComponentProps<typeof DataRanges>) => (
      <DataRanges {...props} mention={mention} />
    )
  }
}
