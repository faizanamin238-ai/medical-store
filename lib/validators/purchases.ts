import { z } from 'zod'

export const PurchaseItemSchema = z.object({
  medicine_id: z.string().uuid('Invalid medicine'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_cost: z.number().min(0, 'Unit cost must be 0 or more'),
  total_cost: z.number().min(0),
})

export const PurchaseSchema = z.object({
  supplier_id: z.string().uuid().optional().or(z.literal('')),
  invoice_number: z.string().max(100).optional().or(z.literal('')),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  payment_status: z.enum(['unpaid', 'partial', 'paid']),
  paid_amount: z.number().min(0),
  items: z.array(PurchaseItemSchema).min(1, 'At least one item is required'),
})

export type PurchaseItemInput = z.infer<typeof PurchaseItemSchema>
export type PurchaseInput = z.infer<typeof PurchaseSchema>
