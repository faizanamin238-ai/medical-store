'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { InviteSchema, UpdateRoleSchema } from '@/lib/validators/team'

export type TeamMember = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string
}

export type PendingInvite = {
  id: string
  invited_email: string
  role: string
  created_at: string
}

export async function listTeamMembers(): Promise<{ data: TeamMember[] }> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('list_team_members') as {
    data: TeamMember[] | null
    error: { message: string } | null
  }
  if (error) return { data: [] }
  return { data: data ?? [] }
}

export async function listPendingInvites(): Promise<{ data: PendingInvite[] }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pharmacy_invites')
    .select('id, invited_email, role, created_at')
    .eq('accepted', false)
    .order('created_at', { ascending: false })

  if (error) return { data: [] }
  return { data: (data ?? []) as PendingInvite[] }
}

export async function inviteTeamMember(raw: unknown) {
  const parsed = InviteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, pharmacy_id')
    .eq('id', user.id)
    .single()
  const profile = profileData as { role: string | null; pharmacy_id: string | null } | null

  if (!profile || profile.role !== 'owner') return { error: 'Only owners can invite team members.' }
  if (!profile.pharmacy_id) return { error: 'Pharmacy not found.' }

  const { email, role } = parsed.data

  const { error: insertError } = await supabase
    .from('pharmacy_invites')
    .insert({
      pharmacy_id: profile.pharmacy_id,
      invited_email: email,
      role,
      invited_by: user.id,
    } as never)

  if (insertError) return { error: insertError.message }

  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/join`,
  })

  if (inviteError) {
    // User already exists in Supabase Auth — invite record is kept so they can
    // accept at /join. Tell the owner so they can notify the person directly.
    if (inviteError.message.toLowerCase().includes('already')) {
      revalidatePath('/team')
      return {
        success: true,
        warning: `${email} already has an account. Ask them to visit /join to accept.`,
      }
    }
    // Unexpected error — clean up the invite record
    await supabase.from('pharmacy_invites').delete().eq('invited_email', email).eq('accepted', false)
    return { error: inviteError.message }
  }

  revalidatePath('/team')
  return { success: true }
}

export async function cancelInvite(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('pharmacy_invites')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/team')
  return { success: true }
}

export async function updateMemberRole(raw: unknown) {
  const parsed = UpdateRoleSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('update_team_member_role', {
    p_profile_id: parsed.data.profile_id,
    p_new_role: parsed.data.role,
  }) as { error: { message: string } | null }

  if (error) return { error: error.message }

  revalidatePath('/team')
  return { success: true }
}

export async function removeMember(profileId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)('remove_team_member', {
    p_profile_id: profileId,
  }) as { error: { message: string } | null }

  if (error) return { error: error.message }

  revalidatePath('/team')
  return { success: true }
}

export async function acceptTeamInvite(fullName: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('accept_team_invite', {
    p_full_name: fullName || null,
  }) as { data: string | null; error: { message: string } | null }

  if (error) return { error: error.message }
  return { success: true, pharmacyName: data }
}
