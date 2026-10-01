import type { Messages } from 'next-intl'

type Namespace = keyof Messages

// Client components receive only the namespaces their surface renders. Page
// metadata, About, Privacy, social cards and other server-only copy stays on
// the server. Every surface includes the site chrome, because a scoped provider
// replaces the layout's for its subtree (see components/surface-messages.tsx).
const chrome = [
  'Header',
  'Social',
  'Footer',
  'Breadcrumbs',
  'Cta',
  'Landing',
  'NotFound'
] as const satisfies readonly Namespace[]

// A rendered result: map, P(doom), details, claims and the conversation.
const result = [
  'Results',
  'Claims',
  'Map',
  'Conversation'
] as const satisfies readonly Namespace[]

const surfaces = {
  /** The owner's interview and result, with sharing and the report export. */
  interview: [
    ...result,
    'Interview',
    'Placement',
    'Feedback',
    'Share',
    'Publish',
    'Errors',
    'Report'
  ],
  /** The owner's library; exports render the map and the report. */
  library: ['Library', 'Publish', 'Errors', 'Report', 'Claims', 'Map'],
  /** Published participant results and simulated-user profiles. */
  published: [...result, 'Persona'],
  /** Local review tools render every assessment surface in English. */
  review: [
    ...result,
    'Interview',
    'Placement',
    'Feedback',
    'Share',
    'Publish',
    'Errors',
    'Report',
    'Library',
    'Persona'
  ]
} as const satisfies Record<string, readonly Namespace[]>
export type Surface = keyof typeof surfaces

export function clientMessages(messages: Messages, surface?: Surface) {
  return Object.fromEntries(
    [...chrome, ...(surface ? surfaces[surface] : [])].map((namespace) => [
      namespace,
      messages[namespace]
    ])
  ) as Partial<Messages>
}
