export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateServerEnv } = await import('./lib/server/validate-env')
    validateServerEnv()
    const { installSdkFetchLogging } =
      await import('./lib/server/upstream-fetch')
    installSdkFetchLogging()
  }
}
