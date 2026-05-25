import { listSales } from '@/lib/actions/sales'
import { SalesTable } from '@/components/sales/sales-table'

export default async function SalesPage() {
  const { data: sales } = await listSales()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">Sales history</p>
      </div>
      <SalesTable data={sales} />
    </div>
  )
}
