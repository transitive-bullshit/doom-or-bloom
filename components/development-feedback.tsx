'use client'

import { useEffect, useState } from 'react'
import { Agentation } from 'agentation'

export function DevelopmentFeedback() {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    // The optional feedback widget requires browser storage. Assessment access
    // must remain available when the browser denies that storage.
    try {
      window.localStorage.getItem('agentation-settings')
      queueMicrotask(() => setAvailable(true))
    } catch {
      // Omit the development widget when its storage is unavailable.
    }
  }, [])
  return available ? (
    <Agentation appName='Doom or Bloom' endpoint='http://localhost:4747' />
  ) : null
}
