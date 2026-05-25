import { z } from 'zod'

export const PrescriptionSchema = z.object({
  customer_id: z.string().uuid().optional().or(z.literal('')),
  doctor_name: z.string().max(200).optional().or(z.literal('')),
  prescription_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export type PrescriptionInput = z.infer<typeof PrescriptionSchema>
