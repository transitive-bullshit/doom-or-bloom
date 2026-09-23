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
import { WorldviewCta } from '@/components/worldview-cta'
import { api } from '@/lib/assessments/client'

export type LibraryItem = {
  id: string
  title: string | null
  lifecycle: 'open' | 'completed'
  visibility: 'private' | 'public'
  updatedAt: string
  isFork: boolean
}
export function AssessmentLibrary({ items }: { items: LibraryItem[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  async function remove(id: string) {
    setBusy(id)
    try {
      await api(`/api/assessments/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete.')
    } finally {
      setBusy(null)
    }
  }
  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-14'>
      <h1 className='text-3xl font-semibold'>My assessments</h1>
      <p className='text-muted-foreground'>
        Your saved assessments are available in this browser. Clearing browser
        cookies loses anonymous access.
      </p>
      <WorldviewCta onlyIfEmpty={false} label='New assessment' />
      {items.length === 0 && (
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
                href={`/assessment/${item.id}`}
                className='font-medium underline'
              >
                {item.title ?? 'Your AI worldview'}
              </Link>
              <div className='flex gap-2'>
                <Badge variant='outline'>
                  {item.lifecycle === 'open' ? 'In progress' : 'Completed'}
                </Badge>
                <Badge variant='outline'>
                  {item.visibility === 'public' ? 'Public' : 'Private'}
                </Badge>
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
                <Link href={`/assessment/${item.id}`}>
                  {item.lifecycle === 'open' ? 'Resume' : 'View'}
                </Link>
              </Button>
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
