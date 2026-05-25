'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PrescriptionSchema } from '@/lib/validators/prescriptions'
import type { Tables } from '@/types/database.types'

export type PrescriptionWithCustomer = Tables<'prescriptions'> & {
  customers: { name: string } | null
}

export async function createPrescription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const raw = {
    customer_id: formData.get('customer_id') as string,
    doctor_name: formData.get('doctor_name') as string,
    prescription_date: formData.get('prescription_date') as string,
    notes: formData.get('notes') as string,
  }

  const parsed = PrescriptionSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  let image_url: string | null = null
  const file = formData.get('image') as File | null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `${pharmacyId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(path, file, { contentType: file.type })

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage.from('prescriptions').getPublicUrl(path)
    image_url = urlData.publicUrl
  }

  const payload = {
    pharmacy_id: pharmacyId,
    customer_id: parsed.data.customer_id || null,
    doctor_name: parsed.data.doctor_name || null,
    prescription_date: parsed.data.prescription_date || null,
    notes: parsed.data.notes || null,
    image_url,
  }

  const { error } = await supabase.from('prescriptions').insert(payload as never)
  if (error) return { error: error.message }

  revalidatePath('/prescriptions')
  if (parsed.data.customer_id) revalidatePath(`/customers/${parsed.data.customer_id}`)
  return { success: true }
}

export async function deletePrescription(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('prescriptions').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/prescriptions')
  return { success: true }
}

export async function listPrescriptions(): Promise<{ data: PrescriptionWithCustomer[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, customers(name)')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as PrescriptionWithCustomer[] }
}

export async function getCustomerPrescriptions(customerId: string): Promise<{ data: Tables<'prescriptions'>[] }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) return { data: [] }
  return { data: (data ?? []) as Tables<'prescriptions'>[] }
}
