'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export async function listAuditLogs(limit = 200): Promise<{ data: AuditLog[] }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: [] }
  return { data: data ?? [] }
}
