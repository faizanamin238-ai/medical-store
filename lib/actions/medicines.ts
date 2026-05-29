'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MedicineSchema, UpdateMedicineSchema } from '@/lib/validators/medicines'
import { logAudit } from '@/lib/audit'
import type { Tables } from '@/types/database.types'

export type MedicineWithCategory = Tables<'medicines'> & {
  categories: { name: string } | null
}

function cleanMedicineInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...data,
    generic_name: data.generic_name || null,
    category_id: data.category_id || null,
    manufacturer: data.manufacturer || null,
    barcode: data.barcode || null,
    batch_number: data.batch_number || null,
    expiry_date: data.expiry_date || null,
    purchase_price: data.purchase_price ?? null,
  }
}

export async function createMedicine(data: unknown) {
  const parsed = MedicineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const payload = {
    ...cleanMedicineInput(parsed.data as Record<string, unknown>),
    pharmacy_id: pharmacyId,
  }

  const { data: inserted, error } = await supabase.from('medicines').insert(payload as never).select('id').single()
  if (error) return { error: error.message }

  await logAudit({ action: 'create', tableName: 'medicine', recordId: inserted?.id, changes: { name: (parsed.data as Record<string, unknown>).name } })
  revalidatePath('/medicines')
  return { success: true }
}

export async function updateMedicine(id: string, data: unknown) {
  const parsed = UpdateMedicineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const payload = cleanMedicineInput(parsed.data as Record<string, unknown>)

  const { error } = await supabase
    .from('medicines')
    .update(payload as never)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) return { error: error.message }

  await logAudit({ action: 'update', tableName: 'medicine', recordId: id })
  revalidatePath('/medicines')
  revalidatePath(`/medicines/${id}`)
  return { success: true }
}

export async function deleteMedicine(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('medicines')
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq('id', id)

  if (error) return { error: error.message }

  await logAudit({ action: 'delete', tableName: 'medicine', recordId: id })
  revalidatePath('/medicines')
  return { success: true }
}

export async function listMedicines(): Promise<{ data: MedicineWithCategory[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('medicines')
    .select('*, categories(name)')
    .is('deleted_at', null)
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as MedicineWithCategory[] }
}

export async function getMedicine(id: string): Promise<{ data: Tables<'medicines'> | null; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Tables<'medicines'> | null }
}

export async function importMedicinesFromCSV(rows: unknown[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', imported: 0, failed: 0, errors: [] as string[] }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found', imported: 0, failed: 0, errors: [] as string[] }

  let imported = 0
  let failed = 0
  const errors: string[] = []

  for (const row of rows) {
    const parsed = MedicineSchema.safeParse(row)
    if (!parsed.success) {
      failed++
      errors.push(parsed.error.issues[0].message)
      continue
    }

    const payload = {
      ...cleanMedicineInput(parsed.data as Record<string, unknown>),
      pharmacy_id: pharmacyId,
    }

    const { error } = await supabase.from('medicines').insert(payload as never)

    if (error) {
      failed++
      errors.push(error.message)
    } else {
      imported++
    }
  }

  revalidatePath('/medicines')
  return { imported, failed, errors }
}
