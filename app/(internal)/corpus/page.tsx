import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { loadBundle } from '@/lib/content/loader'
import { localDebugAvailable } from '@/lib/debug/local-access'
import { CorpusInspector } from '@/components/debug/content/corpus'

export default async function CorpusPage() {
  await connection()
  if (!localDebugAvailable()) notFound()
  const bundle = loadBundle()
  return (
    <CorpusInspector
      references={bundle.references}
      contentVersion={bundle.manifest.contentVersion}
    />
  )
}
