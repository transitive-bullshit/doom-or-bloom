import type { ReactNode } from 'react'
import { cn } from 'cn'
import styles from './assessment-page.module.css'

export function AssessmentPage({
  as: Tag = 'div',
  className,
  children
}: {
  as?: 'div' | 'main'
  className?: string
  children: ReactNode
}) {
  return <Tag className={cn(styles.page, className)}>{children}</Tag>
}
