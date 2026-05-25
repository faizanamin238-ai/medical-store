'use client'

import { useState, useTransition } from 'react'
import { inviteTeamMember } from '@/lib/actions/team'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'

export function InviteDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'error' | 'warning' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setEmail('')
    setRole('')
    setMessage(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const result = await inviteTeamMember({ email, role })
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if ('warning' in result && result.warning) {
        setMessage({ type: 'warning', text: result.warning as string })
      } else {
        setOpen(false)
        reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger className={buttonVariants({ size: 'sm' })}>
        <UserPlus className="h-4 w-4" /> Invite member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="pharmacist@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: string | null) => setRole(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {message && (
            <p className={`text-sm rounded-md px-3 py-2 ${
              message.type === 'error' ? 'bg-destructive/10 text-destructive' :
              message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
              'bg-green-50 text-green-800'
            }`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending || !email || !role}>
              {isPending ? 'Sending…' : 'Send invite'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset() }}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
