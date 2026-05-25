import { z } from 'zod'

export const MedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(200),
  generic_name: z.string().max(200).optional().or(z.literal('')),
  category_id: z.string().uuid().optional().or(z.literal('')),
  manufacturer: z.string().max(200).optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
  batch_number: z.string().max(100).optional().or(z.literal('')),
  expiry_date: z.string().optional().or(z.literal('')),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().min(0, 'Sale price must be 0 or more'),
  stock_quantity: z.number().int().min(0),
  reorder_level: z.number().int().min(0),
  prescription_required: z.boolean(),
  unit: z.string().min(1),
})

export const UpdateMedicineSchema = MedicineSchema.partial().required({ sale_price: true })

export type MedicineInput = z.infer<typeof MedicineSchema>
export type UpdateMedicineInput = z.infer<typeof UpdateMedicineSchema>
