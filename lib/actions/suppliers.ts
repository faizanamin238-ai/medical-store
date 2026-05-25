'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SupplierSchema } from '@/lib/validators/suppliers'
import type { Tables } from '@/types/database.types'

function cleanSupplierInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    contact_person: data.contact_person || null,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    gst_number: data.gst_number || null,
  }
}

export async function createSupplier(data: unknown) {
  const parsed = SupplierSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const payload = {
    ...cleanSupplierInput(parsed.data as Record<string, unknown>),
    pharmacy_id: pharmacyId,
  }

  const { error } = await supabase.from('suppliers').insert(payload as never)
  if (error) return { error: error.message }

  revalidatePath('/suppliers')
  return { success: true }
}

export async function updateSupplier(id: string, data: unknown) {
  const parsed = SupplierSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const payload = cleanSupplierInput(parsed.data as Record<string, unknown>)

  const { error } = await supabase
    .from('suppliers')
    .update(payload as never)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/suppliers')
  revalidatePath(`/suppliers/${id}`)
  return { success: true }
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/suppliers')
  return { success: true }
}

export async function listSuppliers(): Promise<{ data: Tables<'suppliers'>[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Tables<'suppliers'>[] }
}

export async function getSupplier(id: string): Promise<{ data: Tables<'suppliers'> | null; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Tables<'suppliers'> | null }
}
