import { ExportCsvButton } from './export-csv-button'
import type { StockAlertRow } from '@/lib/actions/reports'

interface StockAlertsTableProps {
  data: StockAlertRow[]
}

const ALERT_LABELS: Record<StockAlertRow['alert_type'], string> = {
  expired: 'Expired',
  expiring_soon: 'Expiring Soon',
  low_stock: 'Low Stock',
}

const ALERT_COLORS: Record<StockAlertRow['alert_type'], string> = {
  expired: 'text-red-700 bg-red-50 border-red-200',
  expiring_soon: 'text-orange-700 bg-orange-50 border-orange-200',
  low_stock: 'text-yellow-700 bg-yellow-50 border-yellow-200',
}

export function StockAlertsTable({ data }: StockAlertsTableProps) {
  const csvRows = data.map((r) => [
    r.name,
    r.unit,
    ALERT_LABELS[r.alert_type],
    r.stock_quantity,
    r.reorder_level,
    r.expiry_date ?? '',
  ])

  const expired = data.filter((r) => r.alert_type === 'expired').length
  const expiringSoon = data.filter((r) => r.alert_type === 'expiring_soon').length
  const lowStock = data.filter((r) => r.alert_type === 'low_stock').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Stock Alerts</h2>
          {data.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {expired > 0 && <span className="text-red-600">{expired} expired · </span>}
              {expiringSoon > 0 && <span className="text-orange-600">{expiringSoon} expiring soon · </span>}
              {lowStock > 0 && <span className="text-yellow-600">{lowStock} low stock</span>}
            </p>
          )}
        </div>
        {data.length > 0 && (
          <ExportCsvButton
            headers={['Medicine', 'Unit', 'Alert', 'Stock', 'Reorder Level', 'Expiry Date']}
            rows={csvRows}
            filename="stock-alerts.csv"
          />
        )}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stock alerts. Everything looks good.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Medicine</th>
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Alert</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Stock</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Reorder Level</th>
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-4">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-muted-foreground ml-1 text-xs">{row.unit}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-medium ${ALERT_COLORS[row.alert_type]}`}>
                      {ALERT_LABELS[row.alert_type]}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">{row.stock_quantity}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.reorder_level}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{row.expiry_date ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
