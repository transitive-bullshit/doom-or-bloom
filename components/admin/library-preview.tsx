'use client'
import { AssessmentTable } from '@/components/assessment/table'
import type { LibraryItem } from '@/components/assessment/library'
export function AdminLibraryPreview({ items }: { items: LibraryItem[] }) {
  return (
    <div className='flex flex-col gap-6'>
      <h2>My assessments</h2>
      <p className='text-sm text-muted-foreground'>
        Participant library preview. Opening an assessment stays inside local
        admin; account and editing actions are omitted.
      </p>
      <AssessmentTable
        items={items}
        busy={false}
        onMakePrivate={() => {}}
        onPublish={() => {}}
        onDelete={() => {}}
        readOnly
        hrefPrefix='/admin/assessments'
      />
    </div>
  )
}
