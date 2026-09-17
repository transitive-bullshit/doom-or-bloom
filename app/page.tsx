import { rootPrompt } from '@/lib/assessment/schema'
export default function Page() {
  return (
    <section className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16'>
      <p className='text-sm text-muted-foreground'>
        Map your AI worldview in three questions.
      </p>
      <h1 className='text-4xl font-semibold tracking-tight text-balance'>
        {rootPrompt}
      </h1>
      <p className='text-muted-foreground'>A few sentences is plenty.</p>
    </section>
  )
}
