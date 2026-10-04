import { expect, test } from 'vitest'
import { requestCountry } from './request-country'

const withCountry = (value?: string) =>
  new Request('http://localhost', {
    headers: value === undefined ? {} : { 'x-vercel-ip-country': value }
  })

test('reads the two-letter country Vercel adds to the request', () => {
  expect(requestCountry(withCountry('DE'))).toBe('DE')
  expect(requestCountry(withCountry(' br '))).toBe('BR')
})

test('missing or malformed countries are null', () => {
  expect(requestCountry(withCountry())).toBeNull()
  expect(requestCountry(withCountry(''))).toBeNull()
  expect(requestCountry(withCountry('USA'))).toBeNull()
  expect(requestCountry(withCountry('1A'))).toBeNull()
})
