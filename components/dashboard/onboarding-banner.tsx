'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, X, Pill, ShoppingCart, Users, UserCog, Settings } from 'lucide-react'

const STEPS = [
  { icon: Pill,        label: 'Add your first medicine',   href: '/medicines/new' },
  { icon: ShoppingCart, label: 'Make a sale at the POS',   href: '/pos' },
  { icon: Users,       label: 'Add a customer',            href: '/customers' },
  { icon: UserCog,     label: 'Invite a team member',      href: '/team' },
  { icon: Settings,    label: 'Configure pharmacy settings', href: '/settings' },
]

const KEY = 'rxm_onboarding_dismissed'

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative rounded-xl border border-blue-200 bg-blue-50 p-5">
      <button
        onClick={dismiss}
        className="absolute right-3 top-3 rounded p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <h2 className="mb-1 text-base font-semibold text-blue-900">Welcome to RxManager!</h2>
      <p className="mb-4 text-sm text-blue-700">Get started in a few quick steps.</p>
      <ol className="space-y-2">
        {STEPS.map((step, i) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-800 hover:bg-blue-100"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                {i + 1}
              </span>
              <step.icon className="h-4 w-4 shrink-0 text-blue-500" />
              {step.label}
              <CheckCircle2 className="ml-auto h-4 w-4 text-blue-300" />
            </Link>
          </li>
        ))}
      </ol>
      <button
        onClick={dismiss}
        className="mt-4 text-xs text-blue-500 hover:text-blue-700 hover:underline"
      >
        Dismiss this guide
      </button>
    </div>
  )
}
