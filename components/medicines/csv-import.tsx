'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { importMedicinesFromCSV } from '@/lib/actions/medicines'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload } from 'lucide-react'

const EXPECTED_HEADERS = [
  'name', 'generic_name', 'manufacturer', 'barcode', 'batch_number',
  'expiry_date', 'purchase_price', 'sale_price', 'stock_quantity',
  'reorder_level', 'unit', 'prescription_required',
]

const CSV_TEMPLATE = EXPECTED_HEADERS.join(',') + '\nParacetamol 500mg,Acetaminophen,Pharma Co,,BT-001,2026-12-31,5.00,10.00,100,20,tablet,false'

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return headers.reduce((obj, h, i) => {
      const val = values[i] ?? ''
      if (h === 'prescription_required') obj[h] = val.toLowerCase() === 'true'
      else if (['purchase_price', 'sale_price', 'stock_quantity', 'reorder_level'].includes(h)) {
        obj[h] = val === '' ? undefined : Number(val)
      } else {
        obj[h] = val
      }
      return obj
    }, {} as Record<string, unknown>)
  })
}

export function CSVImport() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      alert('No valid rows found in CSV.')
      return
    }

    setLoading(true)
    const res = await importMedicinesFromCSV(rows)
    setLoading(false)
    if ('error' in res && res.error) {
      alert(res.error)
    } else {
      setResult({ imported: res.imported, failed: res.failed, errors: res.errors ?? [] })
      if (res.imported > 0) router.refresh()
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medicines-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null) }}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
        <Upload className="h-4 w-4" />
        Import CSV
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk import medicines</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple medicines at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            Download template CSV
          </Button>

          {!result ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFile}
                disabled={loading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
              />
              {loading && <p className="mt-2 text-sm text-muted-foreground">Importing…</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ {result.imported} medicines imported</p>
              {result.failed > 0 && (
                <div>
                  <p className="text-sm text-destructive">✗ {result.failed} rows failed</p>
                  <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              <Button size="sm" onClick={() => { setResult(null); setOpen(false) }}>Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
