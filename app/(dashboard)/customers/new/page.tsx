import { CustomerForm } from '@/components/customers/customer-form'

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Customer</h1>
        <p className="text-sm text-muted-foreground mt-1">Register a new customer</p>
      </div>
      <div className="max-w-2xl"><CustomerForm /></div>
    </div>
  )
}
