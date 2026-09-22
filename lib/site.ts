import { people } from '@/components/landing/people'

export const siteUrl = 'https://www.doom-or-bloom.com'

export const publicPages = [
  {
    path: '/',
    title: 'Doom or Bloom',
    description: 'Explore the AI worldview map.'
  },
  {
    path: '/assessment',
    title: 'Assessment',
    description: 'Map your AI worldview through a few open-ended questions.'
  },
  {
    path: '/about',
    title: 'About',
    description: 'The project and its approach.'
  },
  {
    path: '/privacy',
    title: 'Privacy',
    description: 'How answers and data are handled.'
  }
]

export const personaPages = people.map((person) => ({
  path: `/users/${person.slug}`,
  title: person.name
}))
