'use client'

import { usePathname } from 'next/navigation'
import { ExportButton } from './export-button'

export function SettingsExportSlot() {
  const pathname = usePathname()
  if (pathname !== '/settings') return null
  return <ExportButton />
}
