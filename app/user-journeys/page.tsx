import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { localDebugAvailable } from '@/lib/debug/local-access'
import { loadBundle } from '@/lib/content/loader'
import { personas } from '@/lib/journeys/catalog'
import { projectJourneyStore } from '@/lib/journeys/store'
import { JourneysInspector } from '@/components/debug/journeys'

export default async function UserJourneysPage() {
  await connection()
  if (!localDebugAvailable()) notFound()
  const bundle = loadBundle()
  return (
    <JourneysInspector
      personas={personas}
      runs={await projectJourneyStore().list()}
      dimensions={bundle.rubric.dimensions}
      contentVersion={bundle.manifest.contentVersion}
    />
  )
}
