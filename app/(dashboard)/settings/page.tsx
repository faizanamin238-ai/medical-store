import { getPharmacySettings } from '@/lib/actions/settings'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const { data: pharmacy, error } = await getPharmacySettings()

  if (error || !pharmacy) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-destructive mt-2">{error ?? 'Failed to load settings.'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your pharmacy profile and preferences.
        </p>
      </div>

      <SettingsForm pharmacy={pharmacy} />
    </div>
  )
}
