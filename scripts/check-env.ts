import { validateServerEnv } from '../lib/server/validate-env'

validateServerEnv({ ...process.env, ASSESSMENT_PROVIDER: 'live' })
console.log('Development environment configuration is valid.')
