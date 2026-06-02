import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavSidebar } from '@/components/shared/nav-sidebar'
import { UserMenu } from '@/components/shared/user-menu'
import { SettingsExportSlot } from '@/components/settings/settings-export-slot'
import type { Tables } from '@/types/database.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Tables<'profiles'> | null

  let pharmacy: Tables<'pharmacies'> | null = null
  if (profile?.pharmacy_id) {
    const { data } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', profile.pharmacy_id)
      .single()
    pharmacy = data as Tables<'pharmacies'> | null
  }

  const fullName = profile?.full_name ?? user.email ?? 'User'
  const role = profile?.role ?? 'owner'
  const pharmacyName = pharmacy?.name ?? 'My Pharmacy'

  const canViewActivity = role === 'owner' || role === 'manager'

  return (
    <div className="flex h-screen overflow-hidden">
      <NavSidebar pharmacyName={pharmacyName} canViewActivity={canViewActivity} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end gap-3 border-b px-4 lg:px-4 pl-14 lg:pl-4">
          <SettingsExportSlot />
          <UserMenu fullName={fullName} role={role} email={user.email ?? ''} />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
