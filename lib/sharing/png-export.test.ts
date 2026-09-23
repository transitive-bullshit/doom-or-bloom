import { renderToStaticMarkup } from 'react-dom/server'
import { cardSchema, ShareCard } from './card'
import { loadSocialPortrait } from './portraits'
import { people } from '@/components/landing/people'
import { expect, test, vi } from 'vitest'
import sharp from 'sharp'
import { POST as exportMap } from '@/app/api/map-png/route'
import { POST as exportCard } from '@/app/api/share-card/route'

vi.mock('@/components/landing/data', () => ({
  loadExamples: async () => people
}))

function request(path: string, body: unknown) {
  return new Request(`http://localhost/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

test('Takumi exports graph and card layouts at twice their logical dimensions', async () => {
  const map = await exportMap(
    request('map-png', {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="900"><rect width="1360" height="900" fill="white"/></svg>'
    })
  )
  expect(map.status).toBe(200)
  expect(
    await sharp(Buffer.from(await map.arrayBuffer())).metadata()
  ).toMatchObject({ width: 2720, height: 1612, format: 'png' })
  const card = await exportCard(
    request('share-card', {
      horizontal: 0.5,
      vertical: 0.5,
      horizontalRange: [0, 1],
      verticalRange: [0, 1],
      provisional: true,
      closestPersonaIds: people.slice(0, 3).map(({ id }) => id)
    })
  )
  expect(card.status).toBe(200)
  expect(
    await sharp(Buffer.from(await card.arrayBuffer())).metadata()
  ).toMatchObject({ width: 2400, height: 1260, format: 'png' })
})

test('graph export rejects remote image references and external entities', async () => {
  for (const svg of [
    '<svg><image href="http://localhost/private"/></svg>',
    '<svg><!ENTITY test SYSTEM "file:///private"></svg>'
  ])
    expect((await exportMap(request('map-png', { svg }))).status).toBe(400)
})

test('share card shows real matched portraits and only the requested metrics', async () => {
  const matches = await Promise.all(
    people.slice(0, 3).map(async ({ id, name, avatar }) => ({
      id,
      name,
      portrait: await loadSocialPortrait(avatar)
    }))
  )
  const data = cardSchema.parse({
    horizontal: 0.5,
    vertical: 0.5,
    horizontalRange: [0.3, 0.7],
    verticalRange: [0.3, 0.7],
    transformation: 0.6,
    provisional: false,
    pdoom: 0.18,
    pdoomToken: '≈18%'
  })
  const html = renderToStaticMarkup(ShareCard({ data, matches }))
  for (const person of matches) {
    expect(html).toContain(person.name)
    expect(html).toContain(person.portrait)
  }
  expect(html).toContain('My AI Worldview')
  expect(html).toContain('P(doom) estimate')
  expect(html).toContain('~18%')
  for (const removed of [
    'DOOM OR BLOOM',
    'More of my worldview',
    'Demonstrated reasoning',
    'Human influence',
    'Expected upside',
    'Expected harm',
    'Estimated range:'
  ])
    expect(html).not.toContain(removed)
  expect(
    (
      await exportCard(
        request('share-card', { ...data, closestPersonaIds: ['../../secret'] })
      )
    ).status
  ).toBe(400)
})
