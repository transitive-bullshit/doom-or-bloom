'use client'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * Shown while Jev is out of budget: the app's own spend budget is used up or
 * TypeSafe has no credits. `saved` follows a submission whose input the server
 * kept; otherwise the participant has not sent anything yet.
 */
export function BudgetNotice({
  saved,
  children
}: {
  saved: boolean
  children?: ReactNode
}) {
  const t = useTranslations('Interview.failure')
  return (
    <Alert data-testid='budget-notice'>
      <AlertTitle className='line-clamp-none'>{t('budgetTitle')}</AlertTitle>
      <AlertDescription className='gap-2'>
        <p>
          {t.rich('budgetBody', {
            link: (chunks) => (
              <a
                className='font-medium text-foreground underline underline-offset-4'
                href='https://x.com/transitive_bs'
                rel='noopener noreferrer'
                target='_blank'
              >
                {chunks}
              </a>
            )
          })}
        </p>
        <p>{saved ? t('budgetSaved') : t('budgetDraft')}</p>
        {children}
      </AlertDescription>
    </Alert>
  )
}
