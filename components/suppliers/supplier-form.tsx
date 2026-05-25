'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { SupplierSchema, type SupplierInput } from '@/lib/validators/suppliers'
import { createSupplier, updateSupplier } from '@/lib/actions/suppliers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Tables } from '@/types/database.types'

interface SupplierFormProps {
  supplier?: Tables<'suppliers'>
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter()
  const isEdit = !!supplier

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SupplierInput>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: supplier ? {
      name: supplier.name,
      contact_person: supplier.contact_person ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      gst_number: supplier.gst_number ?? '',
    } : {},
  })

  const onSubmit = async (data: SupplierInput) => {
    const result = isEdit
      ? await updateSupplier(supplier.id, data)
      : await createSupplier(data)

    if (result.error) {
      alert(result.error)
    } else {
      router.push('/suppliers')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="space-y-1.5">
          <Label htmlFor="name">Supplier name *</Label>
          <Input id="name" {...register('name')} placeholder="ABC Pharmaceuticals" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact_person">Contact person</Label>
          <Input id="contact_person" {...register('contact_person')} placeholder="John Doe" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="+92 300 0000000" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} placeholder="supplier@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} placeholder="123 Street, City" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gst_number">GST number</Label>
          <Input id="gst_number" {...register('gst_number')} placeholder="12-34-5678-901-2" />
        </div>

      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Update supplier' : 'Add supplier'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/suppliers')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
