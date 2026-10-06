import Image from 'next/image'
import { quotesDataSchema, type BlogQuote } from '@/lib/blog/schema'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import { ChartFigure, englishChartText, type ChartText } from './chart-parts'

/** "Sep 16, 2026", or "Jan 2026" when only the month is known. */
const quoteDate = (date: string, tag: string) =>
  new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'short',
    ...(date.length > 7 && { day: 'numeric' }),
    timeZone: 'UTC'
  }).format(new Date(date))

/**
 * Two people's exact words side by side from committed JSON, topic by topic,
 * each linked to where it was said: two columns on wide screens, stacked and
 * named on phones. Names with a profile link to it. Quotes stay in the
 * speaker's words, like the statements on profiles.
 */
export function DataQuotes({
  data,
  text = englishChartText(),
  mention = (label) => [{ text: label }]
}: {
  data: unknown
  text?: ChartText
  mention?: ProfileMentions
}) {
  const chart = quotesDataSchema.parse(data)
  return (
    <ChartFigure
      slot='blog-data-quotes'
      title={chart.title}
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <div className='hidden grid-cols-2 gap-6 border-b pb-3 sm:grid'>
        {chart.people.map((person) => (
          <Person key={person.key} person={person} mention={mention} />
        ))}
      </div>
      <div className='flex flex-col gap-6'>
        {chart.rows.map((row) => (
          <section key={row.label} className='flex flex-col gap-3'>
            <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              {row.label}
            </p>
            <div className='grid gap-4 sm:grid-cols-2 sm:gap-6'>
              {chart.people.map((person) => (
                <Quote
                  key={person.key}
                  quote={row.quotes[person.key]!}
                  name={person.name}
                  tag={text.tag}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ChartFigure>
  )
}

function Person({
  person,
  mention
}: {
  person: { name: string; avatar?: string }
  mention: ProfileMentions
}) {
  return (
    <p className='flex items-center gap-2.5 font-semibold'>
      {person.avatar && (
        <Image
          src={person.avatar}
          alt=''
          width={32}
          height={32}
          sizes='32px'
          quality={90}
          className='image-outline size-8 shrink-0 rounded-full object-cover'
        />
      )}
      <span>
        <MentionText parts={mention(person.name)} />
      </span>
    </p>
  )
}

function Quote({
  quote,
  name,
  tag
}: {
  quote: BlogQuote
  name: string
  tag: string
}) {
  return (
    <figure className='flex flex-col gap-1.5 border-l-2 border-chart-ink/40 pl-3'>
      <blockquote lang='en' cite={quote.href} className='text-pretty'>
        <p>“{quote.quote}”</p>
      </blockquote>
      <figcaption className='text-xs text-muted-foreground'>
        <span className='font-medium text-body-foreground sm:sr-only'>
          {name}
          {', '}
        </span>
        <a
          href={quote.href}
          target='_blank'
          rel='noreferrer'
          className='underline underline-offset-4 hover:text-foreground'
        >
          {quote.venue}
        </a>
        {', '}
        <time dateTime={quote.date}>{quoteDate(quote.date, tag)}</time>
      </figcaption>
    </figure>
  )
}
