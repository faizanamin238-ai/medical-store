import { z } from 'zod'

export const SettingsSchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  gst_number: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  tax_rate: z.coerce.number().min(0).max(100),
  receipt_footer: z.string().optional(),
})

export type SettingsInput = z.infer<typeof SettingsSchema>
