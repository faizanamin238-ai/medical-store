import type { Metadata } from 'next'
import Link from 'next/link'
import { Pill } from 'lucide-react'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">RxManager</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="mb-10 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 space-y-8">

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">1. Who we are</h2>
            <p>
              RxManager (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a pharmacy management software platform. Our service is accessible at{' '}
              <span className="font-medium">rxmanager.app</span>. This policy explains how we collect, use, and protect
              information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">2. Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong>Account information:</strong> Your name, email address, and pharmacy details when you sign up.</li>
              <li><strong>Pharmacy data:</strong> Medicines, sales, customers, suppliers, and team members that you enter into the system. This data belongs to you.</li>
              <li><strong>Usage data:</strong> Pages visited, actions taken, and error logs — used to improve the product.</li>
              <li><strong>Cookies:</strong> Session cookies required for authentication. No third-party tracking cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">3. How we use your information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide and operate the RxManager service.</li>
              <li>To send transactional emails (account invites, password resets).</li>
              <li>To diagnose bugs and improve performance.</li>
              <li>We do not sell your data to third parties.</li>
              <li>We do not use your pharmacy data to train machine-learning models.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">4. Data isolation & security</h2>
            <p>
              Each pharmacy account is a separate tenant. Your data is isolated using Postgres Row-Level Security (RLS)
              policies — no other tenant can access your records. Data is stored on Supabase infrastructure, which is
              hosted on AWS. All data is encrypted in transit (TLS) and at rest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">5. Data retention</h2>
            <p>
              Your data is retained for as long as your account is active. If you close your account, your data will be
              deleted within 30 days upon written request to{' '}
              <a href="mailto:hello@rxmanager.app" className="text-blue-600 hover:underline">hello@rxmanager.app</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">6. Third-party services</h2>
            <p>We use the following sub-processors:</p>
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>Vercel</strong> — application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">7. Your rights</h2>
            <p>
              You may request a copy of your data, correction of inaccurate data, or deletion of your account by emailing{' '}
              <a href="mailto:hello@rxmanager.app" className="text-blue-600 hover:underline">hello@rxmanager.app</a>.
              You can also export all your data in CSV format from the Settings page at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you by email or an in-app notice at least
              14 days before material changes take effect.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">9. Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:hello@rxmanager.app" className="text-blue-600 hover:underline">hello@rxmanager.app</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          <a href="mailto:hello@rxmanager.app" className="hover:text-gray-900">Contact</a>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} RxManager</div>
      </footer>
    </div>
  )
}
