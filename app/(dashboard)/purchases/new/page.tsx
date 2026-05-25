import { listSuppliers } from '@/lib/actions/suppliers'
import { listMedicines } from '@/lib/actions/medicines'
import { PurchaseForm } from '@/components/purchases/purchase-form'

export default async function NewPurchasePage() {
  const [{ data: suppliers }, { data: medicines }] = await Promise.all([
    listSuppliers(),
    listMedicines(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Purchase Invoice</h1>
        <p className="text-sm text-muted-foreground mt-1">Record stock received from a supplier</p>
      </div>
      <PurchaseForm suppliers={suppliers} medicines={medicines} />
    </div>
  )
}
