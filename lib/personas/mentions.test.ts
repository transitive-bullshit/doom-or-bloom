import { describe, expect, test } from 'vitest'
import { people } from '@/components/landing/people'
import { profileMentions } from './mentions'

const mention = profileMentions([
  { slug: 'darioamodei', name: 'Dario Amodei' },
  { slug: 'noahpinion', name: 'Noah Smith' },
  { slug: 'emilymbender', name: 'Emily M. Bender' },
  { slug: 'drfeifei', name: 'Fei-Fei Li' },
  { slug: 'tszzl', name: 'Roon' },
  { slug: 'seconds_0', name: 'Seconds' }
])

describe('profile mentions', () => {
  test('link the first mention of each full name, keeping the rest as text', () => {
    expect(
      mention(
        'Noah Smith’s estimate, unlike Dario Amodei’s, is lower. Noah Smith says so.'
      )
    ).toEqual([
      { text: 'Noah Smith', slug: 'noahpinion' },
      { text: '’s estimate, unlike ' },
      { text: 'Dario Amodei', slug: 'darioamodei' },
      { text: '’s, is lower. Noah Smith says so.' }
    ])
  })

  test('share first mentions across calls with one set', () => {
    const linked = new Set<string>()
    expect(mention('Ask Dario Amodei.', linked)).toHaveLength(3)
    expect(mention('Dario Amodei replied.', linked)).toEqual([
      { text: 'Dario Amodei replied.' }
    ])
  })

  test('match whole names only, without guessing at single words', () => {
    for (const text of [
      'Noah Smithson and Noah Smith-Jones',
      'Roon and Seconds later',
      'noah smith',
      'Amodei alone'
    ])
      expect(mention(text)).toEqual([{ text }])
    expect(mention('Fei-Fei Li, Emily Bender and Emily M. Bender')).toEqual([
      { text: 'Fei-Fei Li', slug: 'drfeifei' },
      { text: ', ' },
      { text: 'Emily Bender', slug: 'emilymbender' },
      { text: ' and Emily M. Bender' }
    ])
    expect(mention('Noah Smith')).toEqual([
      { text: 'Noah Smith', slug: 'noahpinion' }
    ])
  })

  test('leave text unchanged without profiles', () => {
    expect(profileMentions([])('Dario Amodei')).toEqual([
      { text: 'Dario Amodei' }
    ])
    expect(mention('')).toEqual([{ text: '' }])
  })

  test('give every multi-word catalog name its own profile', () => {
    const all = profileMentions(people)
    for (const { name, slug } of people.filter(({ name }) =>
      name.includes(' ')
    ))
      expect({ name, parts: all(name) }).toEqual({
        name,
        parts: [{ text: name, slug }]
      })
  })
})
