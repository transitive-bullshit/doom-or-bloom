import { AsyncLocalStorage } from 'node:async_hooks'

type RequestContext = { requestId: string; route: string; method?: string }
// Instrumentation and route bundles must use the same request-local store.
const key = Symbol.for('doom-or-bloom.diagnostic-context')
const shared = globalThis as typeof globalThis & {
  [key]?: AsyncLocalStorage<RequestContext>
}
const context = (shared[key] ??= new AsyncLocalStorage<RequestContext>())

export function diagnosticContext() {
  return context.getStore()
}

export function withDiagnosticContext<T>(
  metadata: NonNullable<ReturnType<typeof diagnosticContext>>,
  action: () => T
): T {
  return context.run(metadata, action)
}
