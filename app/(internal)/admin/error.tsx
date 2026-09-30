'use client'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <Alert>
      <AlertTitle>Could not load admin data</AlertTitle>
      <AlertDescription>
        <p>
          Check the selected database connection and schema, then try again.
          Restart with pnpm admin:local or pnpm admin:production to switch
          targets.
        </p>
        <Button variant='outline' onClick={reset}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}
