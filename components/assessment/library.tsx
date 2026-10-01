'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { AssessmentTable } from './table'
import { PublishConfirmation } from './publish-confirmation'
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
import { writeCompareTarget, type CompareTarget } from '@/lib/sharing/compare'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'

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
  autoStart = false,
  compare = null
}: {
  autoStart?: boolean
  /** Someone the visitor came to compare with; see lib/sharing/compare.ts. */
  compare?: CompareTarget | null
  items: LibraryItem[]
  signedIn: boolean
  profile: { name: string; image: string | null } | null
  authEnabled: boolean
  authError: 'claim' | 'signin' | null
}) {
  const router = useRouter()
  const root = useTranslations()
  const t = useTranslations('Library')
  const [busy, setBusy] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<LibraryItem | null>(null)
  const [publishing, setPublishing] = useState<LibraryItem | null>(null)
  // A returning visitor can compare their newest result instead of starting.
  const latest = items
    .filter((item) => item.hasResults)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  async function remove(id: string) {
    setBusy(id)
    try {
      await api(`/api/assessments/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      toast.error(userErrorMessage(root, err, t('deleteFailed')))
    } finally {
      setBusy(null)
    }
  }
  async function setVisibility(
    item: LibraryItem,
    visibility: 'private' | 'public'
  ) {
    setBusy(item.id)
    try {
      await api(`/api/assessments/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          expectedRevision: item.revision,
          visibility
        })
      })
      router.refresh()
    } catch (err) {
      toast.error(userErrorMessage(root, err, t('visibilityFailed')))
    } finally {
      setBusy(null)
    }
  }
  return (
    <div className='content-column flex flex-col gap-8 py-8'>
      <h1>{t('title')}</h1>
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
        <AssessmentStart automatic={autoStart} compare={compare} />
      </div>
      {compare && !autoStart && latest && (
        <Card className='gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-1.5'>
            <CardTitle className='text-lg'>{t('compareTitle')}</CardTitle>
            <CardDescription>{t('compareDescription')}</CardDescription>
          </div>
          <Button
            type='button'
            variant='outline'
            className='shrink-0'
            onClick={() => {
              writeCompareTarget(latest.id, compare)
              router.push(`/assessments/${latest.id}`)
            }}
          >
            {t('compareLatest')}
          </Button>
        </Card>
      )}
      {items.length === 0 && !autoStart && <p>{t('empty')}</p>}
      {items.length > 0 && (
        <AssessmentTable
          items={items}
          busy={busy !== null}
          onMakePrivate={(item) => void setVisibility(item, 'private')}
          onPublish={setPublishing}
          onDelete={setDeleting}
        />
      )}
      <Dialog
        open={publishing !== null}
        onOpenChange={(open) => {
          if (!open) setPublishing(null)
        }}
      >
        <PublishConfirmation
          onConfirm={() => {
            if (publishing) void setVisibility(publishing, 'public')
          }}
        />
      </Dialog>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{t('keep')}</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant='destructive'
                onClick={() => {
                  if (deleting) void remove(deleting.id)
                }}
              >
                {t('deleteConfirm')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
