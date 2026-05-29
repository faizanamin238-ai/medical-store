'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loginAction, demoLoginAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Mode = 'real' | 'demo'

export function LoginForm({
  error,
  demoAvailable,
}: {
  error?: string
  demoAvailable: boolean
}) {
  const [mode, setMode] = useState<Mode>('real')

  return (
    <div className="space-y-4">
      {demoAvailable && (
        <div
          role="tablist"
          aria-label="Login mode"
          className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'real'}
            onClick={() => setMode('real')}
            className={cn(
              'rounded-sm px-3 py-1.5 text-sm font-medium transition',
              mode === 'real'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Real Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'demo'}
            onClick={() => setMode('demo')}
            className={cn(
              'rounded-sm px-3 py-1.5 text-sm font-medium transition',
              mode === 'demo'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Demo Mode
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {mode === 'real' ? (
        <form action={loginAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Your password" required />
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>

          <div className="text-center">
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      ) : (
        <form action={demoLoginAction} className="space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            Demo mode signs you in as a shared sample pharmacy account — no credentials needed.
            Data may be shared with other demo users.
          </div>

          <Button type="submit" className="w-full">
            Continue as Demo User
          </Button>
        </form>
      )}
    </div>
  )
}
