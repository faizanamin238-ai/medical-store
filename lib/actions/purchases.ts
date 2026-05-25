'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PurchaseSchema } from '@/lib/validators/purchases'
import type { Tables } from '@/types/database.types'

export type PurchaseWithSupplier = Tables<'purchases'> & {
  suppliers: { name: string } | null
}

export type PurchaseWithItems = Tables<'purchases'> & {
  suppliers: { name: string } | null
  purchase_items: (Tables<'purchase_items'> & {
    medicines: { name: string; unit: string } | null
  })[]
}

export async function createPurchase(data: unknown) {
  const parsed = PurchaseSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { supplier_id, invoice_number, invoice_date, payment_status, paid_amount, items } = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: purchaseId, error } = await (supabase.rpc as any)('create_purchase_with_items', {
    p_supplier_id: supplier_id || null,
    p_invoice_number: invoice_number || null,
    p_invoice_date: invoice_date,
    p_payment_status: payment_status,
    p_paid_amount: paid_amount,
    p_items: items,
  }) as { data: string | null; error: { message: string } | null }

  if (error) return { error: error.message }

  revalidatePath('/purchases')
  revalidatePath('/medicines')
  return { success: true, id: purchaseId }
}

export async function listPurchases(): Promise<{ data: PurchaseWithSupplier[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(name)')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as PurchaseWithSupplier[] }
}

export async function getPurchase(id: string): Promise<{ data: PurchaseWithItems | null; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(name), purchase_items(*, medicines(name, unit))')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as PurchaseWithItems | null }
}

export async function updatePaymentStatus(id: string, payment_status: string, paid_amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('purchases')
    .update({ payment_status, paid_amount } as never)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/purchases')
  revalidatePath(`/purchases/${id}`)
  return { success: true }
}
