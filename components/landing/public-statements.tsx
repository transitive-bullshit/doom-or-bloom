import { useLocale, useTranslations } from 'next-intl'
import { languageTag } from '@/i18n/config'
import type {
  PublicStatement,
  PublicStatements as Statements
} from '@/lib/personas/public-statements'

const displayDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    ...(date.length > 7 && { day: 'numeric' }),
    timeZone: 'UTC'
  }).format(new Date(date))

/**
 * What the real person has said about AI: short quotes in their own words,
 * newest first on a timeline so changes of view show, each linked to its
 * source. Quotes and the summary stay English, like the rest of the profile.
 */
export function PublicStatements({
  name,
  statements
}: {
  name: string
  statements: Statements
}) {
  const t = useTranslations('Persona')
  const tag = languageTag(useLocale())
  const verified = statements.statements
    .map((statement) => statement.verified)
    .toSorted()[0]!
  return (
    <section
      data-slot='public-statements'
      aria-labelledby='public-statements-title'
      className='flex flex-col gap-6'
    >
      <div className='flex flex-col gap-2'>
        <h2 id='public-statements-title'>{t('statementsTitle', { name })}</h2>
        <p lang='en' className='text-body-foreground'>
          {statements.summary}
        </p>
      </div>
      <ol className='flex flex-col gap-7 border-l-2 pl-5'>
        {statements.statements.map((statement) => (
          <Statement
            key={`${statement.url}:${statement.quote}`}
            statement={statement}
            date={displayDate(statement.date, tag)}
          />
        ))}
      </ol>
      <p className='text-xs text-muted-foreground'>
        {t('statementsNote', { date: displayDate(verified, tag) })}
      </p>
    </section>
  )
}

function Statement({
  statement,
  date
}: {
  statement: PublicStatement
  date: string
}) {
  return (
    <li className='relative'>
      <span
        aria-hidden='true'
        className='absolute top-1 -left-[1.7rem] size-3 rounded-full border-2 border-background bg-primary'
      />
      <figure className='flex flex-col gap-2'>
        <time
          dateTime={statement.date}
          className='text-sm font-semibold text-muted-foreground'
        >
          {date}
        </time>
        <blockquote
          lang='en'
          cite={statement.url}
          className='text-base leading-relaxed text-pretty sm:text-lg'
        >
          <p>“{statement.quote}”</p>
        </blockquote>
        <figcaption className='text-sm text-muted-foreground'>
          <a
            href={statement.url}
            target='_blank'
            rel='noreferrer'
            className='underline underline-offset-4 hover:text-foreground'
          >
            {statement.venue}
          </a>
        </figcaption>
      </figure>
    </li>
  )
}
