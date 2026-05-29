'use client'

import { useTransition } from 'react'
import { exportAllData } from '@/lib/actions/backup'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

function toCsv(rows: unknown[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0] as object)
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape((r as Record<string, unknown>)[h])).join(',')),
  ].join('\n')
}

function download(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function ExportButton() {
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    startTransition(async () => {
      const result = await exportAllData()
      if (result.error) { alert(result.error); return }
      const date = new Date().toISOString().slice(0, 10)
      ;(['medicines', 'sales', 'customers', 'suppliers', 'purchases'] as const).forEach(key => {
        const rows = result[key] ?? []
        if ((rows as unknown[]).length) download(`${key}-${date}.csv`, toCsv(rows as unknown[]))
      })
    })
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isPending}>
      <Download className="h-4 w-4" />
      {isPending ? 'Exporting…' : 'Export all data'}
    </Button>
  )
}
