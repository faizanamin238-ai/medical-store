import { ExportCsvButton } from './export-csv-button'
import type { TopMedicineRow } from '@/lib/actions/reports'

interface TopMedicinesTableProps {
  data: TopMedicineRow[]
}

export function TopMedicinesTable({ data }: TopMedicinesTableProps) {
  const csvRows = data.map((r, i) => [
    i + 1,
    r.name,
    r.unit,
    r.qty_sold,
    r.revenue.toFixed(2),
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Top Medicines by Revenue</h2>
        <ExportCsvButton
          headers={['Rank', 'Medicine', 'Unit', 'Qty Sold', 'Revenue']}
          rows={csvRows}
          filename="top-medicines.csv"
        />
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales data yet.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground w-10">#</th>
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Medicine</th>
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Unit</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Qty Sold</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.medicine_id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 px-4 font-medium">{row.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{row.unit}</td>
                  <td className="py-2.5 px-4 text-right">{row.qty_sold.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-medium">
                    {row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
