import type { Metadata } from 'next'
import Link from 'next/link'
import { Pill } from 'lucide-react'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
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
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Terms of Service</h1>
        <p className="mb-10 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">1. Acceptance of terms</h2>
            <p>
              By creating an account or using RxManager (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Service. These terms apply to all users, including pharmacy owners,
              managers, pharmacists, and cashiers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">2. Description of service</h2>
            <p>
              RxManager is a cloud-based pharmacy management platform that provides inventory management, point-of-sale,
              customer records, reporting, and team management features. The Service is provided on a subscription basis
              as described on our <Link href="/pricing" className="text-blue-600 hover:underline">pricing page</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">3. Your account & data</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>All data you enter into RxManager remains yours. We do not claim ownership of your pharmacy data.</li>
              <li>You are responsible for the accuracy of data entered and compliance with applicable local laws (drug regulations, prescription requirements, data protection).</li>
              <li>You may export all your data at any time from the Settings page.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6 mt-2">
              <li>Use the Service for any unlawful purpose or to sell controlled substances illegally.</li>
              <li>Attempt to access another pharmacy&apos;s data or circumvent the multi-tenant isolation.</li>
              <li>Reverse-engineer, decompile, or attempt to extract the Service&apos;s source code.</li>
              <li>Use automated scripts to scrape or overload the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">5. Subscription & billing</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>A 14-day free trial is available with no credit card required.</li>
              <li>After the trial, a paid plan is required to continue using the Service.</li>
              <li>Subscriptions are billed monthly. You may cancel at any time; no refunds are provided for partial billing periods.</li>
              <li>We reserve the right to change pricing with at least 30 days&apos; notice to active subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">6. Limitation of liability</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law,
              RxManager shall not be liable for any indirect, incidental, or consequential damages arising from your
              use of the Service, including but not limited to loss of data, loss of revenue, or dispensing errors.
              Your sole remedy for dissatisfaction is to stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">7. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted service. Scheduled maintenance will be
              announced in advance where possible. We are not liable for downtime caused by third-party infrastructure
              (Supabase, Vercel, or internet connectivity issues).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">8. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. On termination, you may export your data for 30 days
              after which it will be permanently deleted. We may suspend accounts that violate these terms without notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">9. Changes to terms</h2>
            <p>
              We may update these Terms at any time. We will notify active users by email at least 14 days before
              material changes take effect. Continued use of the Service after that date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">10. Contact</h2>
            <p>
              Questions about these Terms? Email{' '}
              <a href="mailto:hello@rxmanager.app" className="text-blue-600 hover:underline">hello@rxmanager.app</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <a href="mailto:hello@rxmanager.app" className="hover:text-gray-900">Contact</a>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} RxManager</div>
      </footer>
    </div>
  )
}
