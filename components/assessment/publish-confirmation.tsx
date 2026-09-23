'use client'

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
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Publish assessment publicly?</DialogTitle>
        <DialogDescription>
          Anyone with the link will be able to view your answers and results.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='outline'>Keep private</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={onConfirm}>Publish assessment</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
