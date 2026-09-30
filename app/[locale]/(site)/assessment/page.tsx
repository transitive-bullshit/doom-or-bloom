import { WorldviewCta } from '@/components/worldview-cta'
export const metadata = {
  title: 'Map your AI worldview',
  robots: { index: false, follow: true }
}
export default function Page() {
  return (
    <div className='content-column flex flex-col gap-6 py-16'>
      <h1>Map your AI worldview</h1>
      <p>A few questions to explore your perspective. No account required.</p>
      <WorldviewCta />
    </div>
  )
}
