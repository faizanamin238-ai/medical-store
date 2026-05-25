import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSale } from '@/lib/actions/sales'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { PrintButton } from '@/components/sales/print-button'
import { ArrowLeft } from 'lucide-react'

function methodLabel(m: string | null) {
  const map: Record<string, string> = { cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer', other: 'Other' }
  return m ? (map[m] ?? m) : '—'
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: sale } = await getSale(id)

  if (!sale) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/sales" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PrintButton />
      </div>

      {/* Receipt */}
      <div id="receipt" className="rounded-lg border p-6 space-y-5">
        <div className="text-center space-y-1 border-b pb-4">
          <h1 className="text-lg font-bold">Sale Receipt</h1>
          <p className="text-sm text-muted-foreground">{new Date(sale.sale_date).toLocaleString()}</p>
          {sale.invoice_number && (
            <p className="text-xs text-muted-foreground">Invoice # {sale.invoice_number}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{sale.customers?.name ?? 'Walk-in'}</p>
            {sale.customers?.phone && <p className="text-xs text-muted-foreground">{sale.customers.phone}</p>}
          </div>
          <div>
            <p className="text-muted-foreground">Payment</p>
            <Badge variant="outline">{methodLabel(sale.payment_method)}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Cashier</p>
            <p className="font-medium">{sale.profiles?.full_name ?? '—'}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="py-1 text-left font-medium">Item</th>
                <th className="py-1 text-right font-medium">Qty</th>
                <th className="py-1 text-right font-medium">Price</th>
                <th className="py-1 text-right font-medium">Disc.</th>
                <th className="py-1 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.sale_items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-1.5">
                    <p>{item.medicines?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{item.medicines?.unit}</p>
                  </td>
                  <td className="py-1.5 text-right">{item.quantity}</td>
                  <td className="py-1.5 text-right">{item.unit_price.toFixed(2)}</td>
                  <td className="py-1.5 text-right">{item.discount > 0 ? `-${item.discount.toFixed(2)}` : '—'}</td>
                  <td className="py-1.5 text-right font-medium">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{sale.subtotal?.toFixed(2) ?? '—'}</span></div>
          {sale.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{sale.discount.toFixed(2)}</span></div>}
          {sale.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>+{sale.tax.toFixed(2)}</span></div>}
          <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span>{sale.total?.toFixed(2) ?? '—'}</span></div>
        </div>

        <p className="text-center text-xs text-muted-foreground border-t pt-3">Thank you for your business!</p>
      </div>
    </div>
  )
}
