import { expect, test } from 'vitest'
import {
  compareUsers,
  directorySorts
} from '@/components/landing/directory-sort'
import type { Example } from '@/components/landing/shared'

test('numeric sorts preserve zero, put missing values last in both directions, and break ties by name', () => {
  for (const key of Object.keys(directorySorts).filter(
    (key) => key !== 'name'
  ) as Exclude<keyof typeof directorySorts, 'name'>[]) {
    const base: Example = {
      id: '',
      name: '',
      slug: '',
      shortName: '',
      initials: '',
      stance: '',
      description: '',
      tone: '',
      outlook: null,
      transformation: null,
      avatar: ''
    }
    const users = [
      { ...base, id: 'missing', name: 'Absent', [key]: null },
      { ...base, id: 'zero', name: 'Zero', [key]: 0 },
      { ...base, id: 'b', name: 'Beta', [key]: 1 },
      { ...base, id: 'a', name: 'Alpha', [key]: 1 }
    ]
    expect(
      [...users].sort((a, b) => compareUsers(a, b, key, 'asc')).map((p) => p.id)
    ).toEqual(['zero', 'a', 'b', 'missing'])
    expect(
      [...users]
        .sort((a, b) => compareUsers(a, b, key, 'desc'))
        .map((p) => p.id)
    ).toEqual(['a', 'b', 'zero', 'missing'])
  }
})
