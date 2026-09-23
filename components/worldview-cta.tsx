import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

export function WorldviewCta({
  label = 'Map your own worldview'
}: {
  label?: string
}) {
  return (
    <ExpandingArrowLink href='/assessments?start=1'>{label}</ExpandingArrowLink>
  )
}
