import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { loadBundle } from '@/lib/content/loader'
import { projectFeedbackStore } from '@/lib/debug/feedback-store'
import { localDebugAvailable } from '@/lib/debug/local-access'
import { QuestionsInspector } from '@/components/debug/content/questions'

export default async function QuestionsPage() {
  await connection()
  if (!localDebugAvailable()) notFound()
  const bundle = loadBundle()
  return (
    <QuestionsInspector
      prompts={bundle.prompts}
      contentVersion={bundle.manifest.contentVersion}
      feedback={await projectFeedbackStore().read('questions')}
    />
  )
}
