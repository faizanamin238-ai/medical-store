'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database.types'
import { AuditLogDetails, RESOURCE_LABEL, resourceLabel } from './audit-log-details'
import { LocalTime } from '@/components/shared/local-time'
import { cn } from '@/lib/utils'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

const ACTION_COLORS: Record<string, string> = {
  create:      'bg-green-100 text-green-800',
  insert:      'bg-green-100 text-green-800',
  update:      'bg-blue-100 text-blue-800',
  delete:      'bg-red-100 text-red-800',
  invite:      'bg-purple-100 text-purple-800',
  role_change: 'bg-yellow-100 text-yellow-800',
  export:      'bg-gray-100 text-gray-800',
}

const ACTION_LABEL: Record<string, string> = {
  insert: 'create',
}

const PAGE_SIZE = 25

function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [actionFilter, setActionFilter] = useState<string | null>(null)
  const [resourceFilter, setResourceFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const actions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs],
  )
  const resources = useMemo(
    () => Array.from(new Set(logs.map((l) => l.table_name))).sort(),
    [logs],
  )

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter && l.action !== actionFilter) return false
      if (resourceFilter && l.table_name !== resourceFilter) return false
      return true
    })
  }, [logs, actionFilter, resourceFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function setActionAndReset(value: string | null) {
    setActionFilter(value)
    setPage(0)
  }
  function setResourceAndReset(value: string | null) {
    setResourceFilter(value)
    setPage(0)
  }

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No audit activity yet.</p>
  }

  return (
    <div className="space-y-3">
      <FilterRow
        label="Action"
        options={actions}
        value={actionFilter}
        onChange={setActionAndReset}
        renderLabel={actionLabel}
        colorMap={ACTION_COLORS}
      />
      <FilterRow
        label="Resource"
        options={resources}
        value={resourceFilter}
        onChange={setResourceAndReset}
        renderLabel={(r) => RESOURCE_LABEL[r] ?? r.replace(/_/g, ' ')}
      />

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Resource</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Details</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">When</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No audit activity matches these filters.
                </td>
              </tr>
            ) : (
              pageRows.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-800'}`}>
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{resourceLabel(log.table_name)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell max-w-xs">
                    <AuditLogDetails
                      action={log.action}
                      tableName={log.table_name}
                      changes={log.changes}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                    <LocalTime iso={log.created_at} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length === 0
            ? 'No results'
            : `Showing ${safePage * PAGE_SIZE + 1}–${Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3 w-3" />
            Prev
          </button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  renderLabel,
  colorMap,
}: {
  label: string
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
  renderLabel: (v: string) => string
  colorMap?: Record<string, string>
}) {
  if (options.length <= 1) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground mr-1">{label}:</span>
      <Chip active={value === null} onClick={() => onChange(null)}>
        All
      </Chip>
      {options.map((opt) => (
        <Chip
          key={opt}
          active={value === opt}
          onClick={() => onChange(opt)}
          tone={colorMap?.[opt]}
        >
          {renderLabel(opt)}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  children,
  active,
  onClick,
  tone,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  tone?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition capitalize',
        active
          ? 'border-foreground bg-foreground text-background'
          : tone
            ? `${tone} border-transparent hover:opacity-80`
            : 'bg-background hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
