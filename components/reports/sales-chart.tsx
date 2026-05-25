'use client'

import { useState, useTransition } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getSalesChartData, type SalesDataPoint } from '@/lib/actions/reports'
import { Button } from '@/components/ui/button'

type Period = 'daily' | 'weekly' | 'monthly'

interface SalesChartProps {
  initialData: SalesDataPoint[]
  initialPeriod: Period
}

export function SalesChart({ initialData, initialPeriod }: SalesChartProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [data, setData] = useState<SalesDataPoint[]>(initialData)
  const [isPending, startTransition] = useTransition()

  function switchPeriod(p: Period) {
    if (p === period) return
    setPeriod(p)
    startTransition(async () => {
      const result = await getSalesChartData(p)
      setData(result.data)
    })
  }

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalSales = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-4 text-sm">
          <span>
            <span className="text-muted-foreground">Total revenue: </span>
            <span className="font-semibold">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Sales: </span>
            <span className="font-semibold">{totalSales}</span>
          </span>
        </div>
        <div className="flex gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              onClick={() => switchPeriod(p)}
              disabled={isPending}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className={isPending ? 'opacity-50 transition-opacity' : ''}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={period === 'daily' ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip
              formatter={(value) => [
                typeof value === 'number'
                  ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : value,
                'Revenue',
              ]}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
