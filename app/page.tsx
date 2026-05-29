import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import {
  Pill,
  ShoppingCart,
  BarChart3,
  Users,
  Shield,
  UserCog,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">RxManager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">
              Pricing
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            <Zap className="h-3 w-3" /> 14-day free trial — no credit card required
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Run your pharmacy <br className="hidden sm:block" />
            <span className="text-blue-600">smarter, not harder</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            All-in-one pharmacy management software. Manage inventory, run your POS,
            track customers, generate reports, and keep your whole team aligned — from one dashboard.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'gap-1')}>
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              Log in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Everything your pharmacy needs</h2>
            <p className="text-gray-500">Built for independent pharmacies and small chains. No bloat, no complexity.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl border bg-gray-50 p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-1 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 px-4 py-20" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="text-gray-500">Start free for 14 days. Upgrade when you are ready.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 ${plan.highlight ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                    Most popular
                  </div>
                )}
                <div className="mb-1 text-sm font-medium text-gray-500">{plan.name}</div>
                <div className="mb-1 text-4xl font-extrabold text-gray-900">{plan.price}</div>
                <div className="mb-6 text-sm text-gray-400">{plan.period}</div>
                <ul className="mb-8 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
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
          <p className="mt-6 text-center text-sm text-gray-400">
            Need multi-branch or custom pricing?{' '}
            <a href="mailto:hello@rxmanager.app" className="text-blue-600 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-10 text-3xl font-bold text-gray-900">Why pharmacists choose RxManager</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STATS.map(s => (
              <div key={s.label} className="rounded-xl bg-blue-50 p-6">
                <div className="mb-1 text-3xl font-extrabold text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-blue-600 px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to modernize your pharmacy?</h2>
          <p className="mb-8 text-blue-100">
            Join pharmacies already using RxManager. Free 14-day trial, no credit card needed.
          </p>
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), 'gap-1')}>
            Start your free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">RxManager</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <a href="mailto:hello@rxmanager.app" className="hover:text-gray-900">Contact</a>
          </div>
          <div className="text-xs text-gray-400">© {new Date().getFullYear()} RxManager</div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    icon: Pill,
    title: 'Inventory Management',
    description: 'Track medicines, monitor expiry dates, get low-stock alerts, and manage purchase orders — all in one place.',
  },
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    description: 'Fast, intuitive POS. Search medicines, apply discounts, collect payment, and print receipts in seconds.',
  },
  {
    icon: Users,
    title: 'Customer Records',
    description: 'Maintain customer profiles, store prescriptions, and view full purchase history for every patient.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Revenue charts, profit margins, top-selling medicines, and stock alerts — exportable to CSV.',
  },
  {
    icon: UserCog,
    title: 'Team Management',
    description: 'Owner, manager, pharmacist, and cashier roles. Invite staff by email and control what they can access.',
  },
  {
    icon: Shield,
    title: 'Secure & Multi-tenant',
    description: "Your pharmacy's data is 100% isolated using Postgres Row-Level Security. No data ever leaks between tenants.",
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$10',
    period: 'per month',
    highlight: false,
    cta: 'Start free trial',
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
    cta: 'Start free trial',
    features: [
      'Up to 5 users',
      'Unlimited medicines',
      'Full reports & CSV export',
      'Customer & prescription management',
      'Audit logs',
      'Priority support',
    ],
  },
  {
    name: 'Chain',
    price: '$75',
    period: 'per month',
    highlight: false,
    cta: 'Contact us',
    features: [
      'Unlimited users',
      'Multi-branch ready',
      'All Pro features',
      'Dedicated onboarding',
      'SLA support',
    ],
  },
]

const STATS = [
  { value: '14 days', label: 'Free trial, no card needed' },
  { value: '< 5 min', label: 'To set up your pharmacy' },
  { value: '100%', label: 'Data isolation per tenant' },
]
