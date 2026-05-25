'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CustomerSchema } from '@/lib/validators/customers'
import type { Tables } from '@/types/database.types'

export type CustomerWithStats = Tables<'customers'> & {
  sales_count: number
  total_spent: number
}

function cleanInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    phone: data.phone || null,
    address: data.address || null,
  }
}

export async function createCustomer(data: unknown) {
  const parsed = CustomerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const { error } = await supabase.from('customers').insert({
    ...cleanInput(parsed.data as Record<string, unknown>),
    pharmacy_id: pharmacyId,
  } as never)
  if (error) return { error: error.message }

  revalidatePath('/customers')
  return { success: true }
}

export async function updateCustomer(id: string, data: unknown) {
  const parsed = CustomerSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('customers')
    .update(cleanInput(parsed.data as Record<string, unknown>) as never)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/customers')
  return { success: true }
}

export async function listCustomers(): Promise<{ data: Tables<'customers'>[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Tables<'customers'>[] }
}

export async function getCustomer(id: string): Promise<{ data: Tables<'customers'> | null; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Tables<'customers'> | null }
}

type CustomerSaleRow = { id: string; sale_date: string; total: number | null; payment_method: string | null }

export async function getCustomerSales(customerId: string): Promise<{ data: CustomerSaleRow[] }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('id, sale_date, total, payment_method')
    .eq('customer_id', customerId)
    .order('sale_date', { ascending: false })
    .limit(20)

  if (error) return { data: [] }
  return { data: (data ?? []) as CustomerSaleRow[] }
}
