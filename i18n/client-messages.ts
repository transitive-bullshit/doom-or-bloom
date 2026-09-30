import type { Messages } from 'next-intl'

// Client components receive only the chrome they render; page metadata and
// other server-only copy stays on the server.
const clientNamespaces = [
  'Header',
  'Social',
  'Footer',
  'Breadcrumbs',
  'Cta',
  'Landing',
  'NotFound'
] as const satisfies readonly (keyof Messages)[]

export function clientMessages(messages: Messages) {
  return Object.fromEntries(
    clientNamespaces.map((namespace) => [namespace, messages[namespace]])
  ) as Pick<Messages, (typeof clientNamespaces)[number]>
}
