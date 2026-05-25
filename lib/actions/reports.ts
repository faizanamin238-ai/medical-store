'use server'

import { createClient } from '@/lib/supabase/server'

export type SalesDataPoint = {
  label: string
  revenue: number
  count: number
}

export type TopMedicineRow = {
  medicine_id: string
  name: string
  unit: string
  qty_sold: number
  revenue: number
}

export type ProfitMarginRow = {
  id: string
  name: string
  unit: string
  purchase_price: number
  sale_price: number
  margin_amount: number
  margin_pct: number
}

export type StockAlertRow = {
  id: string
  name: string
  unit: string
  stock_quantity: number
  reorder_level: number
  expiry_date: string | null
  alert_type: 'expired' | 'expiring_soon' | 'low_stock'
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function getSalesChartData(
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
): Promise<{ data: SalesDataPoint[] }> {
  const supabase = await createClient()
  const now = new Date()

  const fromDate =
    period === 'daily' ? addDays(now, -29) :
    period === 'weekly' ? addDays(now, -83) :
    addDays(now, -364)

  const { data, error } = await supabase
    .from('sales')
    .select('sale_date, total')
    .gte('sale_date', fromDate.toISOString())
    .order('sale_date')

  if (error) return { data: [] }

  const sales = (data ?? []) as { sale_date: string; total: number | null }[]
  const map = new Map<string, { revenue: number; count: number }>()

  for (const sale of sales) {
    const d = new Date(sale.sale_date)
    let key: string

    if (period === 'daily') {
      key = isoDate(d)
    } else if (period === 'weekly') {
      const jan1 = new Date(d.getFullYear(), 0, 1)
      const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
      key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    const existing = map.get(key) ?? { revenue: 0, count: 0 }
    existing.revenue += sale.total ?? 0
    existing.count += 1
    map.set(key, existing)
  }

  const result: SalesDataPoint[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (period === 'daily') {
    for (let i = 0; i < 30; i++) {
      const d = addDays(fromDate, i)
      const key = isoDate(d)
      const entry = map.get(key) ?? { revenue: 0, count: 0 }
      result.push({ label: key.slice(5), revenue: entry.revenue, count: entry.count })
    }
  } else if (period === 'weekly') {
    for (let i = 11; i >= 0; i--) {
      const d = addDays(now, -i * 7)
      const jan1 = new Date(d.getFullYear(), 0, 1)
      const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
      const key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
      const entry = map.get(key) ?? { revenue: 0, count: 0 }
      result.push({ label: `W${String(week).padStart(2, '0')}`, revenue: entry.revenue, count: entry.count })
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = map.get(key) ?? { revenue: 0, count: 0 }
      result.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        revenue: entry.revenue,
        count: entry.count,
      })
    }
  }

  return { data: result }
}

export async function getTopMedicines(limit = 10): Promise<{ data: TopMedicineRow[] }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sale_items')
    .select('medicine_id, quantity, total, medicines(name, unit)')
    .limit(5000)

  if (error) return { data: [] }

  const items = (data ?? []) as {
    medicine_id: string
    quantity: number
    total: number | null
    medicines: { name: string; unit: string } | null
  }[]

  const map = new Map<string, { name: string; unit: string; qty_sold: number; revenue: number }>()

  for (const item of items) {
    const existing = map.get(item.medicine_id) ?? {
      name: item.medicines?.name ?? 'Unknown',
      unit: item.medicines?.unit ?? '',
      qty_sold: 0,
      revenue: 0,
    }
    existing.qty_sold += item.quantity
    existing.revenue += item.total ?? 0
    map.set(item.medicine_id, existing)
  }

  return {
    data: Array.from(map.entries())
      .map(([medicine_id, v]) => ({ medicine_id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit),
  }
}

export async function getProfitMarginReport(): Promise<{ data: ProfitMarginRow[] }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, unit, purchase_price, sale_price')
    .not('purchase_price', 'is', null)
    .order('name')

  if (error) return { data: [] }

  const medicines = (data ?? []) as {
    id: string
    name: string
    unit: string
    purchase_price: number
    sale_price: number
  }[]

  return {
    data: medicines
      .filter((m) => m.purchase_price > 0)
      .map((m) => {
        const margin_amount = m.sale_price - m.purchase_price
        const margin_pct = (margin_amount / m.purchase_price) * 100
        return { ...m, margin_amount, margin_pct }
      })
      .sort((a, b) => b.margin_pct - a.margin_pct),
  }
}

export async function getStockAlerts(): Promise<{ data: StockAlertRow[] }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, unit, stock_quantity, reorder_level, expiry_date')
    .order('name')

  if (error) return { data: [] }

  const medicines = (data ?? []) as {
    id: string
    name: string
    unit: string
    stock_quantity: number
    reorder_level: number
    expiry_date: string | null
  }[]

  const today = new Date()
  const thirtyDaysOut = addDays(today, 30)
  const alerts: StockAlertRow[] = []

  for (const m of medicines) {
    if (m.expiry_date) {
      const exp = new Date(m.expiry_date)
      if (exp <= today) {
        alerts.push({ ...m, alert_type: 'expired' })
        continue
      }
      if (exp <= thirtyDaysOut) {
        alerts.push({ ...m, alert_type: 'expiring_soon' })
        continue
      }
    }
    if (m.stock_quantity <= m.reorder_level) {
      alerts.push({ ...m, alert_type: 'low_stock' })
    }
  }

  return { data: alerts }
}
