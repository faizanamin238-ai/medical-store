import { createClient } from '@/lib/supabase/server'
import { listTeamMembers, listPendingInvites } from '@/lib/actions/team'
import { TeamTable } from '@/components/team/team-table'
import { PendingInvitesTable } from '@/components/team/pending-invites-table'
import { InviteDialog } from '@/components/team/invite-dialog'
import type { Tables } from '@/types/database.types'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const profile = profileData as Pick<Tables<'profiles'>, 'role'> | null
  const currentRole = profile?.role ?? null
  const isOwner = currentRole === 'owner'

  const [{ data: members }, { data: invites }] = await Promise.all([
    listTeamMembers(),
    isOwner ? listPendingInvites() : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your pharmacy staff
          </p>
        </div>
        {isOwner && <InviteDialog />}
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Team members</h2>
        <TeamTable
          members={members}
          currentUserId={user!.id}
          isOwner={isOwner}
        />
      </section>

      {isOwner && <PendingInvitesTable invites={invites} />}

      {!isOwner && currentRole !== 'manager' && (
        <p className="text-sm text-muted-foreground">
          Contact your pharmacy owner to manage team settings.
        </p>
      )}
    </div>
  )
}
