'use client'
import type { PostHog, PostHogConfig } from 'posthog-js'
import { sanitizeEvent } from './events'
import type { Catalog, Event } from './events'
let catalog: Catalog = { prompts: {}, resources: [] }
let configured = false
let client: Promise<PostHog> | undefined
export function configureAnalytics(assets: Catalog, enabled: boolean) {
  catalog = assets
  configured = enabled
}
export function sanitizePostHog<
  T extends {
    event: string
    properties: Record<string, unknown>
  }
>(event: T) {
  const result = sanitizeEvent(
    {
      name: event.event,
      assessmentId: event.properties.distinct_id,
      properties: event.properties
    },
    catalog
  )
  if (!result) return null
  return {
    ...event,
    properties: {
      ...result.properties,
      // The SDK requires its public project identifier after before_send.
      token: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      distinct_id: result.assessmentId,
      $process_person_profile: false
    }
  }
}
export const posthogPrivacyConfig = {
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  save_campaign_params: false,
  save_referrer: false,
  capture_dead_clicks: false,
  rageclick: false,
  capture_exceptions: false,
  capture_heatmaps: false,
  capture_performance: false,
  disable_session_recording: true,
  enable_recording_console_log: false,
  disable_surveys: true,
  person_profiles: 'never',
  advanced_disable_flags: true,
  disable_external_dependency_loading: true,
  disable_persistence: true,
  persistence: 'memory',
  debug: false,
  before_send: (event) => (event ? sanitizePostHog(event) : null)
} satisfies Partial<PostHogConfig>
export function emitEvent(event: Event) {
  if (!configured || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true')
    return
  const safe = sanitizeEvent(event, catalog)
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!safe || !key || !host) return
  client ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, { ...posthogPrivacyConfig, api_host: host })
    return posthog
  })
  void client
    .then((posthog) => {
      posthog.capture(safe.name, {
        ...safe.properties,
        distinct_id: safe.assessmentId,
        $process_person_profile: false
      })
    })
    .catch(() => {
      /* Analytics failure does not interrupt assessment work. */
    })
}
