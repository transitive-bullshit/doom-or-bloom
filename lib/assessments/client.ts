'use client'
import { assessmentErrorMessage } from './error-messages'
import { submitSchema, type Submission } from './contracts'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json')
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers
  }).catch(() => {
    throw new ApiError(0, 'Unable to connect. Please try again.')
  })
  const text = await response.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    throw new ApiError(
      response.status,
      'Unable to reach your saved assessment. Please try again.'
    )
  }
  if (!response.ok && !body?.operation)
    throw new ApiError(
      response.status,
      assessmentErrorMessage(response.status, body?.code)
    )
  return body as T
}

export function userErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError && error.status >= 400 && error.status < 500
    ? error.message
    : fallback
}

let starting: Promise<{ id: string | null }> | undefined
export async function startAssessment(onlyIfEmpty: boolean) {
  if (starting) return starting
  const start = async () => {
    const session = await api<{ user?: { id: string } } | null>(
      '/api/auth/get-session'
    )
    if (!session?.user)
      await api('/api/auth/sign-in/anonymous', { method: 'POST', body: '{}' })
    const keyName = `doom-or-bloom:create:${onlyIfEmpty}`
    let requestKey = crypto.randomUUID() as string
    try {
      requestKey = localStorage.getItem(keyName) ?? requestKey
      localStorage.setItem(keyName, requestKey)
    } catch {
      /* The in-memory key still protects this request. */
    }
    const result = await api<{ id: string | null }>('/api/assessments', {
      method: 'POST',
      body: JSON.stringify({ requestKey, onlyIfEmpty })
    })
    try {
      localStorage.removeItem(keyName)
    } catch {
      /* Storage is optional. */
    }
    return result
  }
  // Serialize first anonymous sign-in across tabs when Web Locks are available.
  starting = (
    navigator.locks
      ? navigator.locks.request('assessment-start', start)
      : start()
  ).finally(() => {
    starting = undefined
  })
  return starting
}

const draftKey = (id: string) => `doom-or-bloom:draft:${id}`
const pendingKey = (id: string) => `doom-or-bloom:pending:${id}`
export function readDraft(id: string, promptId: string) {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey(id)) ?? 'null')
    return value?.promptId === promptId && typeof value.text === 'string'
      ? value.text
      : ''
  } catch {
    return ''
  }
}
export function writeDraft(id: string, promptId: string, text: string) {
  localStorage.setItem(draftKey(id), JSON.stringify({ promptId, text }))
}
export function readPending(id: string): Submission | null {
  try {
    const value = submitSchema.safeParse(
      JSON.parse(localStorage.getItem(pendingKey(id)) ?? 'null')
    )
    return value.success && value.data.assessmentId === id ? value.data : null
  } catch {
    return null
  }
}
export function writePending(input: Submission | null, id: string) {
  if (input) localStorage.setItem(pendingKey(id), JSON.stringify(input))
  else localStorage.removeItem(pendingKey(id))
}
