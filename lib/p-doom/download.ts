import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { hubContent, type HubPerson } from '@/lib/p-doom/hub'
import { siteUrl } from '@/lib/site'

const cell = (value: string) => `"${value.replaceAll('"', '""')}"`

/**
 * The same curated, published people as the hub, with source context retained.
 * Tokens stay text: no range midpoints, inferred values or zero for a refusal.
 * Dates retain their recorded precision; the dataset date matches the hub.
 */
export function hubCsv(
  people: readonly HubPerson[],
  statements: typeof publicPdoomStatements = publicPdoomStatements
) {
  const { rows, asOf } = hubContent(people, statements)
  const bySlug = new Map(
    people.map((person) => [person.slug, statements[person.id]])
  )
  const records = rows.map((row) => {
    const statement = row.token === null ? undefined : bySlug.get(row.slug)
    return [
      row.name,
      row.token === null ? 'no_number' : 'stated',
      row.token ?? '',
      row.quote ?? '',
      row.note ?? '',
      statement?.outcome ?? '',
      statement?.horizon ?? '',
      statement?.conditions ?? '',
      row.source.title,
      row.source.url,
      row.source.published ?? row.source.year?.toString() ?? '',
      `${siteUrl}/users/${row.slug}`,
      `${siteUrl}/p-doom#pdoom-table-title`,
      asOf
    ]
  })
  return (
    [
      [
        'name',
        'statement_type',
        'stated_p_doom',
        'quote',
        'note',
        'outcome',
        'horizon',
        'conditions',
        'source_title',
        'source_url',
        'source_published',
        'profile_url',
        'citation_url',
        'dataset_as_of'
      ],
      ...records
    ]
      .map((record) => record.map(cell).join(','))
      .join('\r\n') + '\r\n'
  )
}
