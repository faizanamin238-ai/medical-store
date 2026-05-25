import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomer, getCustomerSales } from '@/lib/actions/customers'
import { getCustomerPrescriptions } from '@/lib/actions/prescriptions'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil } from 'lucide-react'
import type { Tables } from '@/types/database.types'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: customer }, { data: sales }, { data: prescriptions }] = await Promise.all([
    getCustomer(id),
    getCustomerSales(id),
    getCustomerPrescriptions(id),
  ])

  if (!customer) notFound()
  const c = customer as Tables<'customers'>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{c.name}</h1>
            {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
          </div>
        </div>
        <Link href={`/customers/${id}/edit`} className={buttonVariants({ variant: 'outline' })}>
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </div>

      {/* Info */}
      {c.address && (
        <div className="rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground mb-1">Address</p>
          <p>{c.address}</p>
        </div>
      )}

      {/* Sales history */}
      <div>
        <h2 className="text-base font-medium mb-3">Recent Sales</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Payment</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2">{new Date(s.sale_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{s.payment_method ?? '—'}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{s.total?.toFixed(2) ?? '—'}</td>
                    <td className="px-4 py-2">
                      <Link href={`/sales/${s.id}`} className="text-xs text-primary hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium">Prescriptions</h2>
          <Link href={`/prescriptions/new?customer_id=${id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Add prescription
          </Link>
        </div>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prescriptions on file.</p>
        ) : (
          <div className="space-y-2">
            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-md border p-3 text-sm flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  {p.doctor_name && <p className="font-medium">Dr. {p.doctor_name}</p>}
                  {p.prescription_date && <p className="text-muted-foreground">{p.prescription_date}</p>}
                  {p.notes && <p className="text-muted-foreground text-xs">{p.notes}</p>}
                </div>
                {p.image_url && (
                  <a href={p.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0">
                    View image
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
