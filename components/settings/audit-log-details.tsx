'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Eye, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const RESOURCE_LABEL: Record<string, string> = {
  medicines: 'medicine',
  medicine: 'medicine',
  sales: 'sale',
  purchases: 'purchase',
  customers: 'customer',
  suppliers: 'supplier',
  team_member: 'team member',
  settings: 'settings',
  backup: 'backup',
  profiles: 'team member',
}

export function resourceLabel(tableName: string): string {
  const raw = RESOURCE_LABEL[tableName] ?? tableName.replace(/_/g, ' ')
  return raw.replace(/^./, (c) => c.toUpperCase())
}

const HIDDEN_FIELDS = new Set([
  'id',
  'pharmacy_id',
  'created_at',
  'updated_at',
  'created_by',
  'cashier_id',
  'deleted_at',
])

const CURRENCY_FIELDS = new Set(['total', 'subtotal', 'discount', 'tax', 'paid_amount', 'total_amount', 'unit_price', 'unit_cost', 'total_cost'])

function shortId(v: unknown): string {
  return typeof v === 'string' && v.length >= 8 ? v.slice(0, 8) : String(v)
}

type Diff = { old: unknown; new: unknown }

function isDiff(v: unknown): v is Diff {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    'old' in (v as object) &&
    'new' in (v as object)
  )
}

function effectiveNewValue(field: string, v: unknown): string {
  return isDiff(v) ? pretty(field, v.new) : pretty(field, v)
}

function pretty(field: string, value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  if (CURRENCY_FIELDS.has(field) && typeof value === 'number') return value.toFixed(2)
  if (field.endsWith('_at') && typeof value === 'string') return value.slice(0, 16).replace('T', ' ')
  return String(value)
}

function fieldLabel(field: string): string {
  return field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function getName(changes: Record<string, unknown> | null): string | null {
  if (!changes) return null
  for (const key of ['name', 'full_name', 'invoice_number', 'email']) {
    const v = changes[key]
    if (typeof v === 'string' && v.length) return v
  }
  return null
}

function summarize(
  action: string,
  tableName: string,
  changes: Record<string, unknown> | null,
): string {
  const resource = RESOURCE_LABEL[tableName] ?? tableName
  const name = getName(changes)

  if (action === 'export') return 'Exported full backup'

  if (action === 'invite') {
    const email = typeof changes?.email === 'string' ? changes.email : null
    const role = typeof changes?.role === 'string' ? changes.role : null
    if (email && role) return `Invited ${email} as ${role}`
    if (email) return `Invited ${email}`
    return 'Invited a team member'
  }

  if (action === 'role_change') {
    const role = typeof changes?.role === 'string' ? changes.role : null
    if (role) return `Changed ${resource} role to ${role}`
    return `Changed ${resource} role`
  }

  if (action === 'create' || action === 'insert') {
    if (name) return `Created ${resource} "${name}"`
    if (typeof changes?.id === 'string') return `Created ${resource} #${shortId(changes.id)}`
    return `Created ${resource}`
  }

  if (action === 'delete') {
    if (name) return `Deleted ${resource} "${name}"`
    return `Deleted ${resource}`
  }

  if (action === 'update') {
    const fields = changes
      ? Object.keys(changes).filter((k) => !HIDDEN_FIELDS.has(k))
      : []
    if (fields.length === 1) {
      const k = fields[0]
      const v = changes![k]
      const label = fieldLabel(k).toLowerCase()
      if (isDiff(v)) {
        return `Updated ${resource} — ${label}: ${pretty(k, v.old)} → ${effectiveNewValue(k, v)}`
      }
      return `Updated ${resource} — ${label}: ${pretty(k, v)}`
    }
    if (fields.length > 1) {
      return `Updated ${resource} — ${fields.map(fieldLabel).join(', ').toLowerCase()}`
    }
    return `Updated ${resource}`
  }

  return `${action} on ${resource}`
}

interface Props {
  action: string
  tableName: string
  changes: unknown
}

export function AuditLogDetails({ action, tableName, changes }: Props) {
  const [showRaw, setShowRaw] = useState(false)

  const obj = (changes && typeof changes === 'object' && !Array.isArray(changes))
    ? (changes as Record<string, unknown>)
    : null

  const summary = summarize(action, tableName, obj)
  const visibleEntries = obj
    ? Object.entries(obj).filter(([k]) => !HIDDEN_FIELDS.has(k))
    : []

  return (
    <div className="flex items-center gap-2">
      <span className="truncate text-foreground">{summary}</span>

      {obj && (
        <Dialog>
          <DialogTrigger
            className={`${buttonVariants({ variant: 'ghost', size: 'icon-sm' })} opacity-0 transition-opacity duration-100 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100`}
            aria-label="View details"
          >
            <Eye className="h-4 w-4" />
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{action}</Badge>
                <span className="capitalize">{RESOURCE_LABEL[tableName] ?? tableName}</span>
              </DialogTitle>
              <DialogDescription>{summary}</DialogDescription>
            </DialogHeader>

            {visibleEntries.length > 0 ? (
              <div className="rounded-md border max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {visibleEntries.map(([k, v]) => (
                      <tr key={k}>
                        <td className="px-3 py-2 align-top font-medium text-muted-foreground w-40">
                          {fieldLabel(k)}
                        </td>
                        <td className="px-3 py-2 align-top break-words font-mono text-xs">
                          {isDiff(v) ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through decoration-red-300">
                                {pretty(k, v.old)}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">
                                {pretty(k, v.new)}
                              </span>
                            </span>
                          ) : (
                            pretty(k, v)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No additional details.</p>
            )}

            {obj && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowRaw((s) => !s)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
                </button>
                {showRaw && (
                  <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
                    {JSON.stringify(obj, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
