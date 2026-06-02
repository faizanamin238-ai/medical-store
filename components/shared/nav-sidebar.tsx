'use client'

import { useState } from 'react'
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
  History,
  Menu,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { logoutAction } from '@/lib/actions/auth'

const baseNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Medicines', href: '/medicines', icon: Pill },
  { label: 'POS', href: '/pos', icon: ShoppingCart },
  { label: 'Sales', href: '/sales', icon: ReceiptText },
  { label: 'Purchases', href: '/purchases', icon: Truck },
  { label: 'Suppliers', href: '/suppliers', icon: ClipboardList },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Activity', href: '/activity', icon: History, ownerOrManagerOnly: true },
  { label: 'Team', href: '/team', icon: UserCog },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

interface NavSidebarProps {
  pharmacyName: string
  canViewActivity?: boolean
}

function NavLinks({
  pharmacyName,
  canViewActivity,
  onNavigate,
}: {
  pharmacyName: string
  canViewActivity?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const navItems = baseNavItems.filter(
    (item) => !('ownerOrManagerOnly' in item && item.ownerOrManagerOnly) || canViewActivity,
  )

  return (
    <aside className="flex h-full w-60 flex-col bg-background">
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
                  onClick={onNavigate}
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

      {/* Sign-out at the bottom of the sidebar */}
      <div className="border-t p-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}

export function NavSidebar({ pharmacyName, canViewActivity }: NavSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full w-60 flex-col border-r">
        <NavLinks pharmacyName={pharmacyName} canViewActivity={canViewActivity} />
      </div>

      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-0 left-0 z-30 flex h-14 items-center px-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <NavLinks
            pharmacyName={pharmacyName}
            canViewActivity={canViewActivity}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
