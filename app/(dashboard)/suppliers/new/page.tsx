import { SupplierForm } from '@/components/suppliers/supplier-form'

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Supplier</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new medicine supplier</p>
      </div>
      <div className="max-w-2xl">
        <SupplierForm />
      </div>
    </div>
  )
}
