import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactNode
} from 'react'
import type { MDXComponents } from 'mdx/types'
import { Link } from '@/i18n/navigation'
import { headingId } from '@/lib/blog/headings'
import { pdoomDefinition } from '@/lib/p-doom/copy'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import type { ChartText } from './chart-parts'
import { DataBars } from './data-bars'
import { DataEstimates } from './data-estimates'
import { DataIntervals } from './data-intervals'
import { DataLandscape } from './data-landscape'
import { DataMap } from './data-map'
import { DataQuotes } from './data-quotes'
import { DataRanges } from './data-ranges'
import { DataScorecard } from './data-scorecard'
import { DataTrend } from './data-trend'

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
  table: (props) => (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-sm' {...props} />
    </div>
  ),
  th: (props) => (
    <th className='border-b px-2 py-2 align-bottom font-semibold' {...props} />
  ),
  DataBars,
  DataEstimates,
  DataIntervals,
  DataLandscape,
  DataMap,
  DataQuotes,
  DataRanges,
  DataScorecard,
  DataTrend,
  Definition
} satisfies MDXComponents

/** The text a heading renders, for its id. */
const textOf = (children: ReactNode): string =>
  Children.toArray(children)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : ''
    )
    .join('')

/**
 * A post's page bindings. Links people with a published profile: the first
 * mention of each in a paragraph, list item or table cell, and every name in a
 * chart. Text inside headings, links and emphasis stays as written. Charts
 * label and format in the post's language. Section headings get the ids of
 * the English headings (`headings`, from `postHeadingIds`), so a link such as
 * `/blog/<slug>#<id>` opens the same section in every language.
 */
export function postComponents({
  mention,
  text,
  headings
}: {
  mention: ProfileMentions
  text: ChartText
  headings: Record<string, string[]>
}): MDXComponents {
  // Headings render in document order, so a repeated heading takes the next of
  // its ids. These components are built for one render of one post.
  const seen = new Map<string, number>()
  const id = (children: ReactNode) => {
    const heading = textOf(children)
    const index = seen.get(heading) ?? 0
    seen.set(heading, index + 1)
    return headings[heading]?.[index] ?? headingId(heading)
  }
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
    h2: ({ children, ...props }) => (
      <h2 id={id(children)} className='scroll-mt-24' {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 id={id(children)} className='scroll-mt-24' {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => <p {...props}>{linkNames(children)}</p>,
    li: ({ children, ...props }) => <li {...props}>{linkNames(children)}</li>,
    td: ({ children, ...props }) => (
      <td className='border-b px-2 py-2 align-top tabular-nums' {...props}>
        {linkNames(children)}
      </td>
    ),
    DataRanges: (props: ComponentProps<typeof DataRanges>) => (
      <DataRanges {...props} mention={mention} text={text} />
    ),
    DataBars: (props: ComponentProps<typeof DataBars>) => (
      <DataBars {...props} mention={mention} text={text} />
    ),
    DataIntervals: (props: ComponentProps<typeof DataIntervals>) => (
      <DataIntervals {...props} text={text} />
    ),
    DataMap: (props: ComponentProps<typeof DataMap>) => (
      <DataMap {...props} mention={mention} text={text} />
    ),
    DataQuotes: (props: ComponentProps<typeof DataQuotes>) => (
      <DataQuotes {...props} mention={mention} text={text} />
    ),
    DataEstimates: (props: ComponentProps<typeof DataEstimates>) => (
      <DataEstimates {...props} mention={mention} text={text} />
    ),
    DataLandscape: (props: ComponentProps<typeof DataLandscape>) => (
      <DataLandscape {...props} text={text} />
    ),
    DataScorecard: (props: ComponentProps<typeof DataScorecard>) => (
      <DataScorecard {...props} text={text} />
    ),
    DataTrend: (props: ComponentProps<typeof DataTrend>) => (
      <DataTrend {...props} text={text} />
    )
  }
}
