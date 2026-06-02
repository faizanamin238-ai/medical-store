import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listAuditLogs } from '@/lib/actions/audit'
import { AuditLogTable } from '@/components/settings/audit-log-table'

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwnerOrManager = profile?.role === 'owner' || profile?.role === 'manager'
  if (!isOwnerOrManager) redirect('/dashboard')

  const { data: logs } = await listAuditLogs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent sensitive actions in your pharmacy. Filter by action or resource, and page through the history.
        </p>
      </div>

      <AuditLogTable logs={logs} />
    </div>
  )
}
