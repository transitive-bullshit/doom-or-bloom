import { loadExamples } from '@/components/landing/data'
import { Harness } from './harness'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ v?: string }>
}) {
  const v = Number((await searchParams).v)
  const examples = (await loadExamples()).map(({ result, ...person }) => ({
    ...person,
    outlook: result.horizontal.value,
    transformation: result.experiment?.transformation.value ?? null
  }))
  return (
    <Harness
      examples={examples}
      initialVariant={Number.isInteger(v) && v >= 1 && v <= 3 ? v - 1 : 0}
    />
  )
}
