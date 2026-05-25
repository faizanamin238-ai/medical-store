import { listSuppliers } from '@/lib/actions/suppliers'
import { SupplierTable } from '@/components/suppliers/supplier-table'

export default async function SuppliersPage() {
  const { data: suppliers } = await listSuppliers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your medicine suppliers</p>
      </div>
      <SupplierTable data={suppliers} />
    </div>
  )
}
