import { getPharmacySettings } from '@/lib/actions/settings'
import { listAuditLogs } from '@/lib/actions/audit'
import { SettingsForm } from '@/components/settings/settings-form'
import { AuditLogTable } from '@/components/settings/audit-log-table'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const isOwnerOrManager = profile?.role === 'owner' || profile?.role === 'manager'

  const [{ data: pharmacy, error }, { data: logs }] = await Promise.all([
    getPharmacySettings(),
    isOwnerOrManager ? listAuditLogs() : Promise.resolve({ data: [] }),
  ])

  if (error || !pharmacy) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-destructive mt-2">{error ?? 'Failed to load settings.'}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your pharmacy profile and preferences.</p>
      </div>

      <SettingsForm pharmacy={pharmacy} />

      {isOwnerOrManager && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Audit log</h2>
            <p className="text-sm text-muted-foreground">Recent sensitive actions in your pharmacy. Filter by action or resource, and page through the history.</p>
            <AuditLogTable logs={logs} />
          </section>
        </>
      )}
    </div>
  )
}
