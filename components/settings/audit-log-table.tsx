import type { Database } from '@/types/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

const ACTION_COLORS: Record<string, string> = {
  create:      'bg-green-100 text-green-800',
  update:      'bg-blue-100 text-blue-800',
  delete:      'bg-red-100 text-red-800',
  invite:      'bg-purple-100 text-purple-800',
  role_change: 'bg-yellow-100 text-yellow-800',
  export:      'bg-gray-100 text-gray-800',
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No audit activity yet.</p>
  }

  return (
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
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-800'}`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{log.table_name}</td>
              <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell truncate max-w-xs">
                {log.changes ? JSON.stringify(log.changes) : '—'}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
