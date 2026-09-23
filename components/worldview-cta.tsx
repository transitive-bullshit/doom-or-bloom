import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

export function WorldviewCta({
  label = 'Map your own worldview',
  size = 'default'
}: {
  size?: 'default' | 'sm'
  label?: string
}) {
  return (
    <ExpandingArrowLink href='/assessments?start=1' size={size}>
      {label}
    </ExpandingArrowLink>
  )
}
