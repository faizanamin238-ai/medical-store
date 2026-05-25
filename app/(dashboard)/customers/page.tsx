import { listCustomers } from '@/lib/actions/customers'
import { CustomerTable } from '@/components/customers/customer-table'

export default async function CustomersPage() {
  const { data: customers } = await listCustomers()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your pharmacy customers</p>
      </div>
      <CustomerTable data={customers} />
    </div>
  )
}
