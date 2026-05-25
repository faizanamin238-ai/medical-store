import { z } from 'zod'

export const InviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['manager', 'pharmacist', 'cashier']),
})

export const UpdateRoleSchema = z.object({
  profile_id: z.string().uuid(),
  role: z.enum(['manager', 'pharmacist', 'cashier']),
})
