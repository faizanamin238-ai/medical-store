'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CustomerSchema, type CustomerInput } from '@/lib/validators/customers'
import { createCustomer, updateCustomer } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Tables } from '@/types/database.types'

export function CustomerForm({ customer }: { customer?: Tables<'customers'> }) {
  const router = useRouter()
  const isEdit = !!customer

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerInput>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: customer ? {
      name: customer.name,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    } : {},
  })

  const onSubmit = async (data: CustomerInput) => {
    const result = isEdit ? await updateCustomer(customer.id, data) : await createCustomer(data)
    if (result.error) alert(result.error)
    else { router.push('/customers'); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} placeholder="Ahmed Khan" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="+92 300 0000000" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} placeholder="123 Street, City" />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Update customer' : 'Add customer'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/customers')}>Cancel</Button>
      </div>
    </form>
  )
}
