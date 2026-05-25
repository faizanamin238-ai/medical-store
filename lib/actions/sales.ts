'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CheckoutSchema } from '@/lib/validators/sales'
import type { Tables } from '@/types/database.types'

export type SaleWithItems = Tables<'sales'> & {
  customers: { name: string; phone: string | null } | null
  profiles: { full_name: string | null } | null
  sale_items: (Tables<'sale_items'> & {
    medicines: { name: string; unit: string } | null
  })[]
}

export type SaleRow = Tables<'sales'> & {
  customers: { name: string } | null
}

export async function checkoutSale(data: unknown) {
  const parsed = CheckoutSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { customer_id, payment_method, discount, tax, items } = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saleId, error } = await (supabase.rpc as any)('checkout_sale', {
    p_customer_id: customer_id || null,
    p_payment_method: payment_method,
    p_discount: discount,
    p_tax: tax,
    p_items: items,
  }) as { data: string | null; error: { message: string } | null }

  if (error) return { error: error.message }

  revalidatePath('/sales')
  revalidatePath('/medicines')
  return { success: true, id: saleId }
}

export async function listSales(): Promise<{ data: SaleRow[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('*, customers(name)')
    .order('sale_date', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as SaleRow[] }
}

export async function getSale(id: string): Promise<{ data: SaleWithItems | null; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('*, customers(name, phone), profiles(full_name), sale_items(*, medicines(name, unit))')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as SaleWithItems | null }
}
