import { z } from 'zod'

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(200),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
})

export type CustomerInput = z.infer<typeof CustomerSchema>
