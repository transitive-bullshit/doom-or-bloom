'use client'
import { createContext, useContext, type ReactNode } from 'react'
import type { AuthoredText } from '@/lib/assessment/display-text'

const AuthoredTextContext = createContext<AuthoredText | null>(null)

/**
 * The authored text (questions, findings, resources and rubric levels) of the
 * rendered assessment's release in the page's locale. Pages load it with
 * `authoredText` or `authoredTextFor` from lib/content/l10n-loader.ts; null
 * in English.
 */
export function AuthoredTextProvider({
  value,
  children
}: {
  value: AuthoredText | null
  children: ReactNode
}) {
  return <AuthoredTextContext value={value}>{children}</AuthoredTextContext>
}

export function useAuthoredText() {
  return useContext(AuthoredTextContext)
}
