import {
  getSalesChartData,
  getTopMedicines,
  getProfitMarginReport,
  getStockAlerts,
} from '@/lib/actions/reports'
import { SalesChart } from '@/components/reports/sales-chart'
import { TopMedicinesTable } from '@/components/reports/top-medicines-table'
import { ProfitMarginTable } from '@/components/reports/profit-margin-table'
import { StockAlertsTable } from '@/components/reports/stock-alerts-table'

export default async function ReportsPage() {
  const [
    { data: salesData },
    { data: topMedicines },
    { data: profitMargin },
    { data: stockAlerts },
  ] = await Promise.all([
    getSalesChartData('monthly'),
    getTopMedicines(10),
    getProfitMarginReport(),
    getStockAlerts(),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics and stock health for your pharmacy</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sales Overview</h2>
        <div className="rounded-md border p-4">
          <SalesChart initialData={salesData} initialPeriod="monthly" />
        </div>
      </section>

      <section>
        <TopMedicinesTable data={topMedicines} />
      </section>

      <section>
        <ProfitMarginTable data={profitMargin} />
      </section>

      <section>
        <StockAlertsTable data={stockAlerts} />
      </section>
    </div>
  )
}
