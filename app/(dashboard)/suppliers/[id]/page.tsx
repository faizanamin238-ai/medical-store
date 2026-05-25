import { notFound } from 'next/navigation'
import { getSupplier } from '@/lib/actions/suppliers'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import type { Tables } from '@/types/database.types'

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: supplier } = await getSupplier(id)

  if (!supplier) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Supplier</h1>
        <p className="text-sm text-muted-foreground mt-1">{(supplier as Tables<'suppliers'>).name}</p>
      </div>
      <div className="max-w-2xl">
        <SupplierForm supplier={supplier as Tables<'suppliers'>} />
      </div>
    </div>
  )
}
