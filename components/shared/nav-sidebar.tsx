'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  ReceiptText,
  Truck,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Medicines', href: '/medicines', icon: Pill },
  { label: 'POS', href: '/pos', icon: ShoppingCart },
  { label: 'Sales', href: '/sales', icon: ReceiptText },
  { label: 'Purchases', href: '/purchases', icon: Truck },
  { label: 'Suppliers', href: '/suppliers', icon: ClipboardList },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Team', href: '/team', icon: UserCog },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface NavSidebarProps {
  pharmacyName: string
}

export function NavSidebar({ pharmacyName }: NavSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <span className="truncate text-sm font-semibold">{pharmacyName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
