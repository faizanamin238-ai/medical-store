'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import type { Database } from '@/types/database.types'
import { AuditLogDetails, resourceLabel } from './audit-log-details'
import { LocalTime } from '@/components/shared/local-time'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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

type FilterGroup = {
  label: string
  rawValues: string[]
}

function buildGroups(
  values: string[],
  toLabel: (v: string) => string,
): FilterGroup[] {
  const byLabel = new Map<string, string[]>()
  for (const v of values) {
    const lbl = toLabel(v)
    const arr = byLabel.get(lbl) ?? []
    arr.push(v)
    byLabel.set(lbl, arr)
  }
  return Array.from(byLabel.entries())
    .map(([label, rawValues]) => ({ label, rawValues }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [actionLabels, setActionLabels] = useState<Set<string>>(new Set())
  const [resourceLabels, setResourceLabels] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)

  const actionGroups = useMemo(
    () => buildGroups(logs.map((l) => l.action), actionLabel),
    [logs],
  )
  const resourceGroups = useMemo(
    () => buildGroups(logs.map((l) => l.table_name), resourceLabel),
    [logs],
  )

  const filtered = useMemo(() => {
    if (actionLabels.size === 0 && resourceLabels.size === 0) return logs
    const allowedActions = new Set<string>()
    if (actionLabels.size > 0) {
      for (const g of actionGroups) {
        if (actionLabels.has(g.label)) g.rawValues.forEach((v) => allowedActions.add(v))
      }
    }
    const allowedResources = new Set<string>()
    if (resourceLabels.size > 0) {
      for (const g of resourceGroups) {
        if (resourceLabels.has(g.label)) g.rawValues.forEach((v) => allowedResources.add(v))
      }
    }
    return logs.filter((l) => {
      if (actionLabels.size > 0 && !allowedActions.has(l.action)) return false
      if (resourceLabels.size > 0 && !allowedResources.has(l.table_name)) return false
      return true
    })
  }, [logs, actionLabels, resourceLabels, actionGroups, resourceGroups])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function toggle(setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
    setPage(0)
  }

  function clearAll() {
    setActionLabels(new Set())
    setResourceLabels(new Set())
    setPage(0)
  }

  const anyActive = actionLabels.size > 0 || resourceLabels.size > 0

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No audit activity yet.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Action"
          groups={actionGroups}
          selected={actionLabels}
          onToggle={(v) => toggle(setActionLabels, v)}
          onClear={() => {
            setActionLabels(new Set())
            setPage(0)
          }}
          colorMap={ACTION_COLORS}
        />
        <FilterDropdown
          label="Resource"
          groups={resourceGroups}
          selected={resourceLabels}
          onToggle={(v) => toggle(setResourceLabels, v)}
          onClear={() => {
            setResourceLabels(new Set())
            setPage(0)
          }}
        />
        {anyActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline ml-1"
          >
            Clear all
          </button>
        )}
      </div>

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
                <tr key={log.id} className="group hover:bg-muted/30">
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

function FilterDropdown({
  label,
  groups,
  selected,
  onToggle,
  onClear,
  colorMap,
}: {
  label: string
  groups: FilterGroup[]
  selected: Set<string>
  onToggle: (label: string) => void
  onClear: () => void
  colorMap?: Record<string, string>
}) {
  if (groups.length <= 1) return null

  const count = selected.size
  const triggerText =
    count === 0
      ? label
      : count === 1
        ? `${label}: ${[...selected][0]}`
        : `${label} (${count})`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium capitalize hover:bg-muted',
          count > 0 && 'border-foreground/40 bg-muted',
        )}
      >
        {triggerText}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {count > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groups.map((g) => (
          <DropdownMenuCheckboxItem
            key={g.label}
            checked={selected.has(g.label)}
            onCheckedChange={() => onToggle(g.label)}
            className="capitalize"
          >
            <span className="flex items-center gap-2">
              {colorMap?.[g.rawValues[0]] && (
                <span className={cn('h-2 w-2 rounded-full', colorMap[g.rawValues[0]].split(' ')[0])} />
              )}
              {g.label}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
