'use client'

import { useTransition } from 'react'
import { cancelInvite } from '@/lib/actions/team'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { PendingInvite } from '@/lib/actions/team'

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  pharmacist: 'Pharmacist',
  cashier: 'Cashier',
}

interface PendingInvitesTableProps {
  invites: PendingInvite[]
}

function CancelButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await cancelInvite(id)
        })
      }}
    >
      <X className="h-3.5 w-3.5" />
    </Button>
  )
}

export function PendingInvitesTable({ invites }: PendingInvitesTableProps) {
  if (invites.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-muted-foreground">Pending invites</h2>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Email</th>
              <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Role</th>
              <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Invited</th>
              <th className="py-2.5 px-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-4 font-medium">{invite.invited_email}</td>
                <td className="py-2.5 px-4 text-muted-foreground">
                  {ROLE_LABELS[invite.role] ?? invite.role}
                </td>
                <td className="py-2.5 px-4 text-xs text-muted-foreground">
                  {new Date(invite.created_at).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-4">
                  <CancelButton id={invite.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
