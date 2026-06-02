'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UserMenuProps {
  fullName: string
  role: string
  email: string
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu({ fullName, role }: UserMenuProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-md p-2 text-sm select-none"
      aria-disabled="true"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials(fullName)}</AvatarFallback>
      </Avatar>
      <div className="hidden text-left md:block">
        <p className="text-sm font-medium leading-none">{fullName}</p>
        <p className="text-xs capitalize text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
