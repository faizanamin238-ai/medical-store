import { ExportCsvButton } from './export-csv-button'
import type { ProfitMarginRow } from '@/lib/actions/reports'

interface ProfitMarginTableProps {
  data: ProfitMarginRow[]
}

function MarginBadge({ pct }: { pct: number }) {
  const color =
    pct >= 30 ? 'text-green-700 bg-green-50 border-green-200' :
    pct >= 10 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
    'text-red-700 bg-red-50 border-red-200'

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-medium ${color}`}>
      {pct.toFixed(1)}%
    </span>
  )
}

export function ProfitMarginTable({ data }: ProfitMarginTableProps) {
  const csvRows = data.map((r) => [
    r.name,
    r.unit,
    r.purchase_price.toFixed(2),
    r.sale_price.toFixed(2),
    r.margin_amount.toFixed(2),
    `${r.margin_pct.toFixed(1)}%`,
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profit Margin by Medicine</h2>
        <ExportCsvButton
          headers={['Medicine', 'Unit', 'Purchase Price', 'Sale Price', 'Margin Amount', 'Margin %']}
          rows={csvRows}
          filename="profit-margin.csv"
        />
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No medicines with purchase price set.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Medicine</th>
                <th className="py-2.5 px-4 text-left font-medium text-muted-foreground">Unit</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Buy Price</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Sale Price</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Margin</th>
                <th className="py-2.5 px-4 text-right font-medium text-muted-foreground">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-4 font-medium">{row.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{row.unit}</td>
                  <td className="py-2.5 px-4 text-right">
                    {row.purchase_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {row.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {row.margin_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <MarginBadge pct={row.margin_pct} />
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
