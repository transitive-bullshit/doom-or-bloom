import { expect, test } from '@playwright/test'

test('the sourced P(doom) download is cached with the database unavailable', async ({
  request
}) => {
  const response = await request.get('/p-doom/data.csv', {
    headers: { Cookie: 'NEXT_LOCALE=es' }
  })
  expect(response.status()).toBe(200)
  expect(response.headers()['x-nextjs-cache']).toBe('HIT')
  expect(response.headers()['content-type']).toContain('text/csv')
  expect(response.headers()['content-disposition']).toContain(
    'attachment; filename="p-doom-public-statements.csv"'
  )
  expect(response.headers()['set-cookie']).toBeUndefined()
  const csv = await response.text()
  expect(csv).toContain('"Geoffrey Hinton","stated","10–20%"')
  expect(csv).toContain('"Yoshua Bengio","no_number",""')
})
