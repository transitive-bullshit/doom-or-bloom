'use client'
import { useEffect } from 'react'
import {
  captureFirstTouch,
  firstTouchCookieString,
  readFirstTouch
} from '@/lib/attribution/first-touch'

// Records how this browser first arrived, once, before any owner exists. The
// server copies it onto the owner at creation; analytics events carry it.
export function FirstTouch() {
  useEffect(() => {
    if (readFirstTouch(document.cookie)) return
    const touch = captureFirstTouch({
      url: new URL(window.location.href),
      referrer: document.referrer,
      now: new Date()
    })
    document.cookie = firstTouchCookieString(
      touch,
      window.location.protocol === 'https:'
    )
  }, [])
  return null
}
