import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPurchase } from '@/lib/actions/purchases'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function paymentBadge(status: string) {
  if (status === 'paid') return <Badge variant="outline" className="border-green-500 text-green-600">Paid</Badge>
  if (status === 'partial') return <Badge variant="outline" className="border-orange-400 text-orange-600">Partial</Badge>
  return <Badge variant="outline" className="border-red-400 text-red-600">Unpaid</Badge>
}

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: purchase } = await getPurchase(id)

  if (!purchase) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/purchases" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">
            Purchase {purchase.invoice_number ? `#${purchase.invoice_number}` : '(no invoice #)'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{purchase.invoice_date}</p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Supplier</p>
            <p className="font-medium">{purchase.suppliers?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment status</p>
            <div className="mt-0.5">{paymentBadge(purchase.payment_status)}</div>
          </div>
          <div>
            <p className="text-muted-foreground">Total amount</p>
            <p className="font-medium">{purchase.total_amount?.toFixed(2) ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount paid</p>
            <p className="font-medium">{purchase.paid_amount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div>
        <h2 className="text-base font-medium mb-3">Items</h2>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Medicine</th>
                <th className="px-4 py-2 text-left font-medium">Unit</th>
                <th className="px-4 py-2 text-right font-medium">Qty</th>
                <th className="px-4 py-2 text-right font-medium">Unit cost</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.purchase_items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.medicines?.name ?? '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{item.medicines?.unit ?? '—'}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{item.unit_cost.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right font-medium">{item.total_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 border-t">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right font-medium">Grand total</td>
                <td className="px-4 py-2 text-right font-semibold">{purchase.total_amount?.toFixed(2) ?? '—'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
