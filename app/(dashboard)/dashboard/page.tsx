import { getDashboardStats } from '@/lib/actions/dashboard'
import { getPharmacySettings } from '@/lib/actions/settings'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'
import { Pill, Users, TrendingUp, AlertTriangle, CalendarClock, ShoppingCart } from 'lucide-react'

export default async function DashboardPage() {
  const [stats, { data: pharmacy }] = await Promise.all([
    getDashboardStats(),
    getPharmacySettings(),
  ])

  const currency = pharmacy?.currency ?? 'USD'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pharmacy?.name ?? 'Your pharmacy'} — overview
        </p>
      </div>

      <OnboardingBanner />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Medicines"
          value={stats.medicineCount.toLocaleString()}
          icon={<Pill className="h-5 w-5 text-blue-500" />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Customers"
          value={stats.customerCount.toLocaleString()}
          icon={<Users className="h-5 w-5 text-violet-500" />}
          bg="bg-violet-50"
        />
        <StatCard
          label="Revenue this month"
          value={fmt(stats.monthlyRevenue)}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          bg="bg-green-50"
        />
        <StatCard
          label="Low-stock items"
          value={stats.lowStock.length.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          bg="bg-amber-50"
          alert={stats.lowStock.length > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent sales */}
        <section className="rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Recent sales</h2>
          </div>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {stats.recentSales.map((s: {
                id: string
                total: number
                payment_method: string
                created_at: string
                customers: { name: string } | null
              }) => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">
                      {(s.customers as { name: string } | null)?.name ?? 'Walk-in'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()} · {s.payment_method}
                    </div>
                  </div>
                  <div className="font-semibold">{fmt(s.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          {/* Low stock */}
          <section className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold">Low stock</h2>
            </div>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stock levels are healthy.</p>
            ) : (
              <ul className="divide-y text-sm">
                {stats.lowStock.map((m: { id: string; name: string; stock_quantity: number; reorder_level: number }) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {m.stock_quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Expiring soon */}
          <section className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-red-400" />
              <h2 className="font-semibold">Expiring in 30 days</h2>
            </div>
            {stats.expiringMeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medicines expiring soon.</p>
            ) : (
              <ul className="divide-y text-sm">
                {stats.expiringMeds.map((m: { id: string; name: string; expiry_date: string | null; stock_quantity: number }) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      {m.expiry_date ?? '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  bg,
  alert = false,
}: {
  label: string
  value: string
  icon: React.ReactNode
  bg: string
  alert?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 ${alert ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}>
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
