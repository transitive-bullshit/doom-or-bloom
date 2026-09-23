import { loadPublished } from '@/lib/assessments/public-server'
import { pageMetadata } from '@/lib/metadata'
import { PublishedResult } from '@/components/assessment/published-result'
import { WorldviewCta } from '@/components/worldview-cta'
export const dynamic = 'force-dynamic'
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  return {
    ...pageMetadata({
      path: `/assessments/public/${id}`,
      title: saved.title,
      description:
        'A shared assessment: the participant’s full conversation and inferred AI worldview.',
      image: `/assessments/public/${id}/social-image.webp`,
      imageAlt: 'AI worldview assessment with interpretation ranges'
    }),
    robots: { index: false, follow: false }
  }
}
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  const state = saved.assessment
  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-14'>
      <h1 className='text-3xl font-semibold'>{saved.title}</h1>
      <p className='text-muted-foreground'>
        {saved.origin === 'simulation'
          ? 'Simulated assessment.'
          : 'Shared by the participant.'}{' '}
        These results interpret the answers below; they are not predictions.
      </p>
      <PublishedResult state={{ ...state, draft: '', eventMarkers: [] }} />
      <h2 className='text-2xl font-semibold'>Full conversation</h2>
      <ol className='flex flex-col gap-6'>
        {state.prompts.map((prompt) => (
          <li key={prompt.id} className='flex flex-col gap-3'>
            <h3 className='font-semibold'>
              {prompt.ordinal}. {prompt.text}
            </h3>
            {state.interactionHistory
              .filter((reply) => reply.promptInstanceId === prompt.id)
              .map((reply) => (
                <div key={reply.requestId}>
                  <p className='whitespace-pre-wrap'>{reply.text}</p>
                  <p className='text-sm text-muted-foreground'>
                    Not used as scoring evidence
                  </p>
                </div>
              ))}
            {state.answers
              .filter((answer) => answer.promptInstanceId === prompt.id)
              .map((answer) => (
                <p key={answer.id} className='whitespace-pre-wrap'>
                  {answer.text}
                </p>
              ))}
          </li>
        ))}
      </ol>
      <details>
        <summary className='cursor-pointer'>
          Complete inferred assessment data
        </summary>
        <pre className='mt-4 max-h-96 overflow-auto rounded-lg border p-4 text-xs'>
          {JSON.stringify(state, null, 2)}
        </pre>
      </details>
      <a className='underline' href={`/assessments/public/${id}/data`}>
        Download shared assessment JSON
      </a>
      <WorldviewCta />
    </main>
  )
}
