'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportCsvButtonProps {
  headers: string[]
  rows: (string | number)[][]
  filename: string
}

export function ExportCsvButton({ headers, rows, filename }: ExportCsvButtonProps) {
  function handleExport() {
    const escape = (v: string | number) => {
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }

    const csv = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport}>
      <Download className="h-3.5 w-3.5" /> Export CSV
    </Button>
  )
}
