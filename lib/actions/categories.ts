'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CategorySchema } from '@/lib/validators/categories'
import type { Tables } from '@/types/database.types'

export async function createCategory(data: unknown) {
  const parsed = CategorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: pharmacyId } = await supabase.rpc('get_user_pharmacy_id') as { data: string | null }
  if (!pharmacyId) return { error: 'Pharmacy not found' }

  const { error } = await supabase.from('categories').insert({
    name: parsed.data.name,
    pharmacy_id: pharmacyId,
  } as never)
  if (error) return { error: error.message }

  revalidatePath('/medicines')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/medicines')
  return { success: true }
}

export async function listCategories(): Promise<{ data: Tables<'categories'>[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as Tables<'categories'>[] }
}
