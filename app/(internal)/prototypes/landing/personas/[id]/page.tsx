import { notFound } from 'next/navigation'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { loadPersona } from '@/components/landing/data'

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await loadPersona((await params).id)
  if (!profile) notFound()
  return (
    <div className='mx-auto w-full max-w-6xl px-6 py-10'>
      <PersonaPageContent
        person={profile.person}
        assessment={profile.assessment}
      />
    </div>
  )
}
