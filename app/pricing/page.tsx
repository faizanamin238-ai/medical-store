import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Pill, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Pricing' }

const PLANS = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '14 days',
    highlight: false,
    cta: 'Start free trial',
    href: '/signup',
    description: 'Full access to all Pro features. No credit card required.',
    features: [
      'All Pro features for 14 days',
      'Up to 5 users',
      'Unlimited medicines',
      'Full reports & CSV export',
      'Customer & prescription management',
      'Audit logs',
    ],
  },
  {
    name: 'Starter',
    price: '$10',
    period: 'per month',
    highlight: false,
    cta: 'Get started',
    href: '/signup',
    description: 'Perfect for a single-pharmacist shop.',
    features: [
      '1 user account',
      'Up to 500 medicines',
      'POS & sales history',
      'Basic reports',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$25',
    period: 'per month',
    highlight: true,
    cta: 'Get started',
    href: '/signup',
    description: 'For growing pharmacies with a team.',
    features: [
      'Up to 5 users',
      'Unlimited medicines',
      'Full reports & CSV export',
      'Customer & prescription management',
      'Audit logs',
      'Priority email support',
    ],
  },
  {
    name: 'Chain',
    price: '$75',
    period: 'per month',
    highlight: false,
    cta: 'Contact us',
    href: 'mailto:hello@rxmanager.app',
    description: 'For multi-branch operations and chains.',
    features: [
      'Unlimited users',
      'Multi-branch ready',
      'All Pro features',
      'Dedicated onboarding call',
      'SLA-backed support',
    ],
  },
]

const FAQ = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. Your 14-day free trial starts immediately after sign-up — no payment info required.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade at any time from the settings page. Changes take effect on your next billing cycle.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'You will be prompted to choose a paid plan. Your data is never deleted — you can pick up right where you left off.',
  },
  {
    q: 'Is my pharmacy data safe?',
    a: 'Absolutely. Every pharmacy is completely isolated using Postgres Row-Level Security. No data is ever shared between tenants.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. You can export all medicines, sales, customers, suppliers, and purchases as CSV files from the Settings page at any time.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">RxManager</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Back link */}
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-extrabold text-gray-900">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-500">Start free for 14 days. No credit card required. Cancel anytime.</p>
        </div>

        {/* Plans */}
        <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-7 ${plan.highlight ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                  Most popular
                </div>
              )}
              <div className="mb-1 text-sm font-medium text-gray-500">{plan.name}</div>
              <div className="mb-0.5 text-4xl font-extrabold text-gray-900">{plan.price}</div>
              <div className="mb-2 text-sm text-gray-400">{plan.period}</div>
              <p className="mb-5 text-sm text-gray-500">{plan.description}</p>
              <ul className="mb-8 flex-1 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({ variant: plan.highlight ? 'default' : 'outline' }),
                  'w-full justify-center'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ.map(item => (
              <div key={item.q} className="rounded-xl border p-6">
                <h3 className="mb-2 font-semibold text-gray-900">{item.q}</h3>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          <a href="mailto:hello@rxmanager.app" className="hover:text-gray-900">Contact</a>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} RxManager</div>
      </footer>
    </div>
  )
}
