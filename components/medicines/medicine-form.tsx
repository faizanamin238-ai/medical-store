'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { MedicineSchema, type MedicineInput } from '@/lib/validators/medicines'
import { createMedicine, updateMedicine } from '@/lib/actions/medicines'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tables } from '@/types/database.types'

const UNITS = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'sachet', 'inhaler', 'patch', 'other']

interface MedicineFormProps {
  medicine?: Tables<'medicines'>
  categories: Tables<'categories'>[]
}

export function MedicineForm({ medicine, categories }: MedicineFormProps) {
  const router = useRouter()
  const isEdit = !!medicine

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<MedicineInput>({
    resolver: zodResolver(MedicineSchema),
    defaultValues: medicine ? {
      name: medicine.name,
      generic_name: medicine.generic_name ?? '',
      category_id: medicine.category_id ?? '',
      manufacturer: medicine.manufacturer ?? '',
      barcode: medicine.barcode ?? '',
      batch_number: medicine.batch_number ?? '',
      expiry_date: medicine.expiry_date ?? '',
      purchase_price: medicine.purchase_price ?? undefined,
      sale_price: medicine.sale_price,
      stock_quantity: medicine.stock_quantity,
      reorder_level: medicine.reorder_level,
      prescription_required: medicine.prescription_required,
      unit: medicine.unit,
    } : {
      stock_quantity: 0,
      reorder_level: 10,
      prescription_required: false,
      unit: 'tablet',
    },
  })

  const onSubmit = async (data: MedicineInput) => {
    const result = isEdit
      ? await updateMedicine(medicine.id, data)
      : await createMedicine(data)

    if (result.error) {
      alert(result.error)
    } else {
      router.push('/medicines')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="space-y-1.5">
          <Label htmlFor="name">Medicine name *</Label>
          <Input id="name" {...register('name')} placeholder="Paracetamol 500mg" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generic_name">Generic name</Label>
          <Input id="generic_name" {...register('generic_name')} placeholder="Acetaminophen" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category_id">Category</Label>
          <Select
            defaultValue={medicine?.category_id ?? ''}
            onValueChange={(v) => setValue('category_id', v || undefined)}
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit</Label>
          <Select
            defaultValue={medicine?.unit ?? 'tablet'}
            onValueChange={(v) => setValue('unit', v ?? 'tablet')}
          >
            <SelectTrigger id="unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" {...register('manufacturer')} placeholder="Pharma Co." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" {...register('barcode')} placeholder="1234567890" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch_number">Batch number</Label>
          <Input id="batch_number" {...register('batch_number')} placeholder="BT-2024-001" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expiry_date">Expiry date</Label>
          <Input id="expiry_date" type="date" {...register('expiry_date')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchase_price">Purchase price</Label>
          <Input id="purchase_price" type="number" step="0.01" {...register('purchase_price', { valueAsNumber: true })} placeholder="0.00" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sale_price">Sale price *</Label>
          <Input id="sale_price" type="number" step="0.01" {...register('sale_price', { valueAsNumber: true })} placeholder="0.00" />
          {errors.sale_price && <p className="text-xs text-destructive">{errors.sale_price.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stock_quantity">Stock quantity</Label>
          <Input id="stock_quantity" type="number" {...register('stock_quantity', { valueAsNumber: true })} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reorder_level">Reorder level</Label>
          <Input id="reorder_level" type="number" {...register('reorder_level', { valueAsNumber: true })} />
        </div>

      </div>

      <div className="flex items-center gap-2">
        <input
          id="prescription_required"
          type="checkbox"
          {...register('prescription_required')}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor="prescription_required">Prescription required</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Update medicine' : 'Add medicine'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/medicines')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
