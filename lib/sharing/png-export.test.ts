import { expect, test } from 'vitest'
import sharp from 'sharp'
import { POST as exportMap } from '@/app/api/map-png/route'
import { POST as exportCard } from '@/app/api/share-card/route'

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
  ).toMatchObject({ width: 2720, height: 1800, format: 'png' })
  const card = await exportCard(
    request('share-card', {
      horizontal: 0.5,
      vertical: 0.5,
      horizontalRange: [0, 1],
      verticalRange: [0, 1],
      provisional: true
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
