'use client'

import { useState, useTransition } from 'react'
import { updatePharmacySettings } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogoUpload } from './logo-upload'
import type { Database } from '@/types/database.types'

type Pharmacy = Database['public']['Tables']['pharmacies']['Row']

const CURRENCIES = [
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
]

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (ET)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PT)' },
  { value: 'UTC', label: 'UTC' },
]

interface SettingsFormProps {
  pharmacy: Pharmacy
}

export function SettingsForm({ pharmacy }: SettingsFormProps) {
  const [form, setForm] = useState({
    name: pharmacy.name,
    address: pharmacy.address ?? '',
    phone: pharmacy.phone ?? '',
    gst_number: pharmacy.gst_number ?? '',
    currency: pharmacy.currency,
    timezone: pharmacy.timezone,
    tax_rate: String(pharmacy.tax_rate ?? 0),
    receipt_footer: pharmacy.receipt_footer ?? '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setMessage(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const result = await updatePharmacySettings({ ...form, tax_rate: Number(form.tax_rate) })
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Settings saved.' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y rounded-lg border bg-card">
      <FormRow
        title="Logo"
        description="Shown on receipts and the sidebar."
      >
        <LogoUpload currentUrl={pharmacy.logo_url} pharmacyName={form.name} />
      </FormRow>

      <FormRow
        title="Pharmacy profile"
        description="Basic info that appears on receipts and customer-facing documents."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Pharmacy name</Label>
            <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+92 300 0000000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gst_number">GST / Tax number</Label>
              <Input id="gst_number" value={form.gst_number} onChange={(e) => set('gst_number', e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} placeholder="Street, City, Country" />
          </div>
        </div>
      </FormRow>

      <FormRow
        title="Financial"
        description="Currency, timezone and default tax rate. Applied across receipts, reports and POS."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v: string | null) => set('currency', v ?? '')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={form.timezone} onValueChange={(v: string | null) => set('timezone', v ?? '')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tax_rate">Tax rate (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.tax_rate}
              onChange={(e) => set('tax_rate', e.target.value)}
            />
          </div>
        </div>
      </FormRow>

      <FormRow
        title="Receipt"
        description="Footer printed at the bottom of every receipt."
      >
        <div className="space-y-1.5">
          <Label htmlFor="receipt_footer">Footer text</Label>
          <Textarea
            id="receipt_footer"
            value={form.receipt_footer}
            onChange={(e) => set('receipt_footer', e.target.value)}
            rows={2}
            placeholder="e.g. Thank you for your purchase! Returns within 7 days."
          />
        </div>
      </FormRow>

      <div className="flex flex-wrap items-center justify-end gap-3 bg-muted/30 p-4 sm:p-6">
        {message && (
          <p
            className={`mr-auto text-sm rounded-md px-3 py-1.5 ${
              message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-800'
            }`}
          >
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  )
}

function FormRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 sm:p-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <h2 className="text-base font-semibold leading-6">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  )
}
