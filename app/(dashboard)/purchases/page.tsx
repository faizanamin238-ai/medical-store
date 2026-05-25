import { listPurchases } from '@/lib/actions/purchases'
import { PurchaseTable } from '@/components/purchases/purchase-table'

export default async function PurchasesPage() {
  const { data: purchases } = await listPurchases()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Purchases</h1>
        <p className="text-sm text-muted-foreground mt-1">Stock-in invoices from suppliers</p>
      </div>
      <PurchaseTable data={purchases} />
    </div>
  )
}
