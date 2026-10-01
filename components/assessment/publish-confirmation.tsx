'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'

export function PublishConfirmation({ onConfirm }: { onConfirm: () => void }) {
  const t = useTranslations('Publish')
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='outline'>{t('keepPrivate')}</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={onConfirm}>{t('confirm')}</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
