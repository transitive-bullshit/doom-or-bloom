import { WorldviewCta } from '@/components/worldview-cta'
import Link from 'next/link'
export const metadata = { title: 'Map your AI worldview' }
export default function Page() {
  return (
    <main className='content-column flex flex-col gap-6 py-16'>
      <h1>Map your AI worldview</h1>
      <p>A few questions to explore your perspective. No account required.</p>
      <WorldviewCta />
      <Link href='/assessments' className='text-sm underline'>
        My assessments
      </Link>
    </main>
  )
}
