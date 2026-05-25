import { notFound } from 'next/navigation'
import { getCustomer } from '@/lib/actions/customers'
import { CustomerForm } from '@/components/customers/customer-form'
import type { Tables } from '@/types/database.types'

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: customer } = await getCustomer(id)
  if (!customer) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Customer</h1>
        <p className="text-sm text-muted-foreground mt-1">{(customer as Tables<'customers'>).name}</p>
      </div>
      <div className="max-w-2xl">
        <CustomerForm customer={customer as Tables<'customers'>} />
      </div>
    </div>
  )
}
