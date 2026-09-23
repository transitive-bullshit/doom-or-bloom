import { expect, test } from 'vitest'
import { validateServerEnv } from './validate-env'

const valid = {
  DATABASE_URL: 'postgresql://localhost/assessments',
  BETTER_AUTH_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters',
  TYPESAFE_API_KEY: 'test-only-key',
  ASSESSMENT_PROVIDER: 'live'
}

test.each([
  'DATABASE_URL',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_SECRET',
  'TYPESAFE_API_KEY'
])('startup and E2E preflight reject missing %s', (name) => {
  expect(() => validateServerEnv({ ...valid, [name]: '' })).toThrow(name)
  expect(() =>
    validateServerEnv({ ...valid, [name]: '' }, { testDatabase: true })
  ).toThrow(name)
})
test('valid runtime and E2E configurations pass', () => {
  expect(() => validateServerEnv(valid)).not.toThrow()
  expect(() =>
    validateServerEnv(
      {
        ...valid,
        TEST_DATABASE_URL: 'postgresql://localhost/assessments_test'
      },
      { testDatabase: true }
    )
  ).not.toThrow()
  expect(() => validateServerEnv(valid, { testDatabase: true })).toThrow(
    'TEST_DATABASE_URL'
  )
})
test('OAuth is optional but partial credentials fail', () => {
  expect(() => validateServerEnv({ ...valid, X_CLIENT_ID: 'id' })).toThrow(
    'X_CLIENT_SECRET'
  )
})
test('explicit test fixtures need no Jev key and are forbidden in production', () => {
  const fixture = {
    ...valid,
    ASSESSMENT_PROVIDER: 'fixture',
    TYPESAFE_API_KEY: ''
  }
  expect(() => validateServerEnv(fixture)).not.toThrow()
  expect(() =>
    validateServerEnv({ ...fixture, NODE_ENV: 'production' })
  ).toThrow('ASSESSMENT_PROVIDER')
})
test('validation errors never include credential values', () => {
  expect(() =>
    validateServerEnv({ ...valid, DATABASE_URL: 'secret-invalid-url' })
  ).toThrow('DATABASE_URL')
  expect(() =>
    validateServerEnv({ ...valid, DATABASE_URL: 'secret-invalid-url' })
  ).toThrow(/^Missing or invalid environment variables: DATABASE_URL\./)
})
