'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Settings page error]', error)
  }, [error])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <p className="font-medium text-destructive">Failed to load settings</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Digest: {error.digest}</p>
        )}
      </div>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  )
}
