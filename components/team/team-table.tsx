'use client'

import { useTransition } from 'react'
import { updateMemberRole, removeMember } from '@/lib/actions/team'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { TeamMember } from '@/lib/actions/team'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  pharmacist: 'Pharmacist',
  cashier: 'Cashier',
}

interface TeamTableProps {
  members: TeamMember[]
  currentUserId: string
  isOwner: boolean
}

function RoleSelect({ member, currentUserId }: { member: TeamMember; currentUserId: string }) {
  const [isPending, startTransition] = useTransition()

  if (member.id === currentUserId || member.role === 'owner') {
    return <span className="text-sm">{ROLE_LABELS[member.role ?? ''] ?? member.role}</span>
  }

  return (
    <Select
      value={member.role ?? ''}
      onValueChange={(v: string | null) => {
        if (!v || v === member.role) return
        startTransition(async () => {
          await updateMemberRole({ profile_id: member.id, role: v })
        })
      }}
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="manager">Manager</SelectItem>
        <SelectItem value="pharmacist">Pharmacist</SelectItem>
        <SelectItem value="cashier">Cashier</SelectItem>
      </SelectContent>
    </Select>
  )
}

function RemoveButton({ memberId, currentUserId }: { memberId: string; currentUserId: string }) {
  const [isPending, startTransition] = useTransition()

  if (memberId === currentUserId) return null

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm('Remove this member from your pharmacy?')) return
        startTransition(async () => {
          await removeMember(memberId)
        })
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}

export function TeamTable({ members, currentUserId, isOwner }: TeamTableProps) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No team members yet.</p>
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Name</th>
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Role</th>
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Member since</th>
            {isOwner && <th className="py-2.5 px-4 w-10" />}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="py-2.5 px-4">
                <span className="font-medium">{member.full_name ?? '—'}</span>
                {member.id === currentUserId && (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                )}
              </td>
              <td className="py-2.5 px-4">
                {isOwner && member.role !== 'owner'
                  ? <RoleSelect member={member} currentUserId={currentUserId} />
                  : <span>{ROLE_LABELS[member.role ?? ''] ?? member.role ?? '—'}</span>
                }
              </td>
              <td className="py-2.5 px-4 text-muted-foreground text-xs">
                {new Date(member.created_at).toLocaleDateString()}
              </td>
              {isOwner && (
                <td className="py-2.5 px-4">
                  {member.role !== 'owner' && (
                    <RemoveButton memberId={member.id} currentUserId={currentUserId} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
