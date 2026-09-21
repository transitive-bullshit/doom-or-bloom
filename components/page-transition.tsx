import { ViewTransition, type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default='none' enter='page-enter' exit='page-exit'>
      {children}
    </ViewTransition>
  )
}
