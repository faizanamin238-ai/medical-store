'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsSchema } from '@/lib/validators/settings'
import { logAudit } from '@/lib/audit'
import type { Database } from '@/types/database.types'

type Pharmacy = Database['public']['Tables']['pharmacies']['Row']

async function getPharmacyId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('pharmacy_id').eq('id', user.id).single()
  return data?.pharmacy_id ?? null
}

export async function getPharmacySettings(): Promise<{ data: Pharmacy | null; error?: string }> {
  const supabase = await createClient()
  const pharmacyId = await getPharmacyId()
  if (!pharmacyId) return { data: null, error: 'Pharmacy not found' }

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', pharmacyId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data }
}

export async function updatePharmacySettings(raw: unknown): Promise<{ error?: string }> {
  const parsed = SettingsSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const pharmacyId = await getPharmacyId()
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const { error } = await supabase
    .from('pharmacies')
    .update(parsed.data)
    .eq('id', pharmacyId)

  if (error) return { error: error.message }
  await logAudit({ action: 'update', tableName: 'settings', changes: { name: parsed.data.name, currency: parsed.data.currency, tax_rate: parsed.data.tax_rate } })
  revalidatePath('/settings')
  return {}
}

export async function uploadLogo(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get('logo') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.type)) return { error: 'Only JPEG, PNG, WebP or SVG allowed' }
  if (file.size > 2 * 1024 * 1024) return { error: 'File must be under 2 MB' }

  const supabase = await createClient()
  const pharmacyId = await getPharmacyId()
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const ext = file.name.split('.').pop()
  const path = `${pharmacyId}/logo.${ext}`
  const admin = createAdminClient()

  // create bucket on first use
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.name === 'pharmacy-logos')) {
    await admin.storage.createBucket('pharmacy-logos', { public: true })
  }

  const { error: uploadError } = await admin.storage
    .from('pharmacy-logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('pharmacy-logos').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('pharmacies')
    .update({ logo_url: publicUrl })
    .eq('id', pharmacyId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/settings')
  return { url: publicUrl }
}
