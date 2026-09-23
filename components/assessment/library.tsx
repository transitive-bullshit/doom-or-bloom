'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogTrigger,
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
        userErrorMessage(err, 'Couldn’t update sharing. Please try again.')
      )
    } finally {
      setBusy(null)
    }
  }
  return (
    <main className='content-column flex flex-col gap-8 py-14'>
      <h1>My assessments</h1>
      <AccountAccess
        signedIn={signedIn}
        profile={profile}
        enabled={authEnabled}
        authError={authError}
      />
      <AssessmentStart automatic={autoStart} />
      {items.length === 0 && !autoStart && (
        <p>No assessments yet. Start whenever you’re ready.</p>
      )}
      <ul className='flex flex-col gap-6'>
        {items.map((item) => (
          <li
            key={item.id}
            className='flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5'
          >
            <div className='flex flex-col gap-2'>
              <Link
                href={`/assessments/${item.id}`}
                className='font-medium underline'
              >
                {item.title ?? 'Your AI worldview'}
              </Link>
              <div className='flex gap-2'>
                {item.visibility === 'public' ? (
                  <Badge asChild variant='outline'>
                    <Link href={`/assessments/public/${item.id}`}>
                      Published
                    </Link>
                  </Badge>
                ) : (
                  <Badge variant='outline'>
                    {item.hasResults ? 'Ready to publish' : 'In progress'}
                  </Badge>
                )}
              </div>
              <time
                className='text-sm text-muted-foreground'
                dateTime={item.updatedAt}
              >
                Saved {new Date(item.updatedAt).toISOString().slice(0, 10)}
              </time>
            </div>
            <div className='flex gap-3'>
              <Button asChild variant='outline'>
                <Link href={`/assessments/${item.id}`}>
                  {item.hasResults ? 'View' : 'Resume'}
                </Link>
              </Button>
              {item.visibility === 'public' && (
                <Button
                  variant='outline'
                  disabled={busy !== null}
                  onClick={() => void makePrivate(item)}
                >
                  Make private
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='ghost' disabled={busy !== null}>
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete this assessment?</DialogTitle>
                    <DialogDescription>
                      This deletes the assessment, results, and saved
                      submissions. Separate assessments created from it are
                      kept.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant='outline'>Keep it</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant='destructive'
                        onClick={() => void remove(item.id)}
                      >
                        Delete assessment
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
