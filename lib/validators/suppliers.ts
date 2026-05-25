import { z } from 'zod'

export const SupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200),
  contact_person: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  gst_number: z.string().max(50).optional().or(z.literal('')),
})

export type SupplierInput = z.infer<typeof SupplierSchema>
