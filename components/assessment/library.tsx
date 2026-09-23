'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { AssessmentTable } from './table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { AssessmentStart } from './start'
import { AccountAccess } from './account-access'
import { api, userErrorMessage } from '@/lib/assessments/client'

export type LibraryItem = {
  id: string
  revision: number
  title: string | null
  hasResults: boolean
  visibility: 'private' | 'public'
  createdAt: string
  updatedAt: string
  isFork: boolean
}
export function AssessmentLibrary({
  items,
  signedIn,
  profile,
  authEnabled,
  authError,
  autoStart = false
}: {
  autoStart?: boolean
  items: LibraryItem[]
  signedIn: boolean
  profile: { name: string; image: string | null } | null
  authEnabled: boolean
  authError: 'claim' | 'signin' | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<LibraryItem | null>(null)
  async function remove(id: string) {
    setBusy(id)
    try {
      await api(`/api/assessments/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      toast.error(
        userErrorMessage(
          err,
          'Couldn’t delete this assessment. Please try again.'
        )
      )
    } finally {
      setBusy(null)
    }
  }
  async function makePrivate(item: LibraryItem) {
    setBusy(item.id)
    try {
      await api(`/api/assessments/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          expectedRevision: item.revision,
          visibility: 'private'
        })
      })
      router.refresh()
    } catch (err) {
      toast.error(
        userErrorMessage(err, 'Couldn’t change visibility. Please try again.')
      )
    } finally {
      setBusy(null)
    }
  }
  return (
    <main className='content-column flex flex-col gap-8 py-8'>
      <h1>My assessments</h1>
      <div
        className={cn(
          'flex flex-col gap-8',
          signedIn && 'md:flex-row md:items-center md:justify-between'
        )}
      >
        <AccountAccess
          signedIn={signedIn}
          profile={profile}
          enabled={authEnabled}
          authError={authError}
        />
        <AssessmentStart automatic={autoStart} />
      </div>
      {items.length === 0 && !autoStart && (
        <p>No assessments yet. Start whenever you’re ready.</p>
      )}
      {items.length > 0 && (
        <AssessmentTable
          items={items}
          busy={busy !== null}
          onMakePrivate={(item) => void makePrivate(item)}
          onDelete={setDeleting}
        />
      )}
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this assessment?</DialogTitle>
            <DialogDescription>
              This deletes the assessment, results, and saved submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Keep it</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant='destructive'
                onClick={() => {
                  if (deleting) void remove(deleting.id)
                }}
              >
                Delete assessment
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
