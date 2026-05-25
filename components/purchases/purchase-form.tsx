'use client'

import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { PurchaseSchema, type PurchaseInput } from '@/lib/validators/purchases'
import { createPurchase } from '@/lib/actions/purchases'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus } from 'lucide-react'
import type { Tables } from '@/types/database.types'

interface PurchaseFormProps {
  suppliers: Tables<'suppliers'>[]
  medicines: Tables<'medicines'>[]
}

export function PurchaseForm({ suppliers, medicines }: PurchaseFormProps) {
  const router = useRouter()

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<PurchaseInput>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: {
      invoice_date: new Date().toISOString().slice(0, 10),
      payment_status: 'unpaid',
      paid_amount: 0,
      items: [{ medicine_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchedItems = useWatch({ control, name: 'items' }) ?? []

  const grandTotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0
    const cost = Number(item?.unit_cost) || 0
    return sum + qty * cost
  }, 0)

  function updateTotalCost(index: number) {
    const items = watchedItems
    const qty = Number(items[index]?.quantity) || 0
    const cost = Number(items[index]?.unit_cost) || 0
    setValue(`items.${index}.total_cost`, qty * cost)
  }

  const onSubmit = async (data: PurchaseInput) => {
    const result = await createPurchase(data)
    if (result.error) {
      alert(result.error)
    } else {
      router.push('/purchases')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Header fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="space-y-1.5">
          <Label>Supplier</Label>
          <Select onValueChange={(v: string | null) => setValue('supplier_id', v || undefined)}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No supplier</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice_number">Invoice number</Label>
          <Input id="invoice_number" {...register('invoice_number')} placeholder="INV-001" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice_date">Invoice date *</Label>
          <Input id="invoice_date" type="date" {...register('invoice_date')} />
          {errors.invoice_date && <p className="text-xs text-destructive">{errors.invoice_date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Payment status</Label>
          <Select
            defaultValue="unpaid"
            onValueChange={(v: string | null) => setValue('payment_status', (v ?? 'unpaid') as PurchaseInput['payment_status'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paid_amount">Amount paid</Label>
          <Input
            id="paid_amount"
            type="number"
            step="0.01"
            {...register('paid_amount', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

      </div>

      {/* Line items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Items</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ medicine_id: '', quantity: 1, unit_cost: 0, total_cost: 0 })}
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>

        {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
          <p className="text-xs text-destructive">{(errors.items as { message?: string }).message}</p>
        )}

        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Medicine</th>
                <th className="px-3 py-2 text-left font-medium w-24">Qty</th>
                <th className="px-3 py-2 text-left font-medium w-32">Unit cost</th>
                <th className="px-3 py-2 text-left font-medium w-32">Total</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const qty = Number(watchedItems[index]?.quantity) || 0
                const cost = Number(watchedItems[index]?.unit_cost) || 0
                const lineTotal = qty * cost

                return (
                  <tr key={field.id} className="border-t">
                    <td className="px-3 py-2">
                      <Select
                        onValueChange={(v: string | null) => setValue(`items.${index}.medicine_id`, v ?? '')}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.items?.[index]?.medicine_id && (
                        <p className="text-xs text-destructive mt-0.5">{errors.items[index]?.medicine_id?.message}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        className="h-8"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: () => updateTotalCost(index),
                        })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8"
                        {...register(`items.${index}.unit_cost`, {
                          valueAsNumber: true,
                          onChange: () => updateTotalCost(index),
                        })}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{lineTotal.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-destructive hover:opacity-70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-muted/50 border-t">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right font-medium">Grand total</td>
                <td className="px-3 py-2 font-semibold">{grandTotal.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create purchase'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/purchases')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
