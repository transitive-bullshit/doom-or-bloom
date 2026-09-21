import { expect, test } from 'vitest'
import { personas } from './catalog'
import { people } from '@/components/landing/people'

test('public persona navigation uses unique lowercase X usernames or named fallbacks', () => {
  expect(new Set(people.map((person) => person.slug)).size).toBe(people.length)
  for (const person of people) {
    const persona = personas.find((entry) => entry.id === person.id)!
    expect(persona.slug).toBe(person.slug)
    expect(persona.xUsername).toBe(person.xUsername)
    expect(person.slug).toBe(person.slug.toLowerCase())
  }
  for (const person of people.filter((entry) => entry.xUrl)) {
    expect(person.xUsername).toBe(
      new URL(person.xUrl!).pathname.slice(1).toLowerCase()
    )
    expect(person.slug).toBe(person.xUsername)
  }
  for (const person of people.filter((entry) => !entry.xUrl)) {
    expect(person.xUsername).toBeNull()
    expect(person.slug).not.toBe(person.id)
  }
  expect(people.find((person) => person.name === 'Donald Trump')?.slug).toBe(
    'realdonaldtrump'
  )
})
