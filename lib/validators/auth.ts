import { z } from 'zod'

export const SignUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  pharmacyName: z.string().min(2, 'Pharmacy name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
