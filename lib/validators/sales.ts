import { z } from 'zod'

export const CartItemSchema = z.object({
  medicine_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
})

export const CheckoutSchema = z.object({
  customer_id: z.string().uuid().optional().or(z.literal('')),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'other']),
  discount: z.number().min(0),
  tax: z.number().min(0),
  items: z.array(CartItemSchema).min(1, 'Cart is empty'),
})

export type CartItem = z.infer<typeof CartItemSchema>
export type CheckoutInput = z.infer<typeof CheckoutSchema>
