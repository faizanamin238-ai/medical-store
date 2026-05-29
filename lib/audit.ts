'server-only'

import { createClient } from '@/lib/supabase/server'

interface AuditParams {
  action: string
  tableName: string
  recordId?: string
  changes?: Record<string, unknown>
}

export async function logAudit({ action, tableName, recordId, changes }: AuditParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('pharmacy_id')
      .eq('id', user.id)
      .single()

    if (!profile?.pharmacy_id) return

    await supabase.from('audit_logs').insert({
      pharmacy_id: profile.pharmacy_id,
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId ?? null,
      changes: (changes ?? null) as import('@/types/database.types').Json | null,
    })
  } catch {
    // audit failure must never break the main operation
  }
}
