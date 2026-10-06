import { postDate } from '@/lib/blog/format'
import { rangeDataSchema } from '@/lib/blog/schema'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import { englishChartText, type ChartText } from './chart-parts'

/**
 * A probability range per row, such as stated P(doom) estimates, from a
 * committed JSON file in content/blog/data. Renders as an accessible table.
 * A person's name links to their profile; `href` records the source.
 */
export function DataRanges({
  data,
  text = englishChartText(),
  mention = (label) => [{ text: label }]
}: {
  data: unknown
  text?: ChartText
  mention?: ProfileMentions
}) {
  const chart = rangeDataSchema.parse(data)
  return (
    <figure
      data-slot='blog-data-ranges'
      className='flex flex-col gap-4 rounded-2xl border p-4 sm:p-6'
    >
      <figcaption className='font-semibold'>{chart.title}</figcaption>
      <table className='w-full table-fixed text-sm'>
        <thead className='sr-only'>
          <tr>
            <th scope='col'>{text.t('who')}</th>
            <th scope='col'>{text.t('estimate')}</th>
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row.label} className='border-b last:border-0'>
              <th
                scope='row'
                className='w-[38%] py-3 pr-3 text-left align-top font-medium'
              >
                <MentionText parts={mention(row.label)} />
                {row.note && (
                  <span className='mt-1 block text-xs font-normal text-muted-foreground'>
                    {row.note}
                  </span>
                )}
              </th>
              <td className='py-3 align-top'>
                <div className='flex items-center gap-3'>
                  <div
                    aria-hidden
                    className='relative h-2.5 min-w-0 flex-1 rounded-full bg-muted'
                  >
                    <span
                      className='absolute top-0 h-2.5 rounded-full bg-coral'
                      style={{
                        left: `min(${row.low * 100}%, calc(100% - 0.625rem))`,
                        width: `max(0.625rem, ${(row.high - row.low) * 100}%)`
                      }}
                    />
                  </div>
                  <span className='w-16 shrink-0 text-right font-semibold tabular-nums'>
                    {row.token}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className='text-xs text-muted-foreground'>
        {text.t('rangeScale')} {chart.source && `${chart.source} `}
        {text.t('asOf', { date: postDate(chart.asOf, text.tag) })}
      </p>
    </figure>
  )
}
