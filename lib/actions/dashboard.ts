'server-only'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    { count: medicineCount },
    { count: customerCount },
    { data: monthlySales },
    { data: lowStockRpc },
    { data: expiringRpc },
    { data: recentSales },
  ] = await Promise.all([
    supabase.from('medicines').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('sales').select('total').gte('created_at', startOfMonth),
    // Use the report_low_stock RPC — a direct column filter would compare
    // stock_quantity against the string literal "reorder_level", not the column.
    supabase.rpc('report_low_stock'),
    supabase.rpc('report_expiring', { p_days: 30 }),
    supabase
      .from('sales')
      .select('id, total, payment_method, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const monthlyRevenue = (monthlySales ?? []).reduce((sum, s) => sum + (s.total ?? 0), 0)

  const lowStock = (lowStockRpc ?? []).slice(0, 5).map(m => ({
    id: m.medicine_id,
    name: m.medicine_name,
    stock_quantity: m.stock_quantity,
    reorder_level: m.reorder_level,
  }))

  const expiringMeds = (expiringRpc ?? []).slice(0, 5).map(m => ({
    id: m.medicine_id,
    name: m.medicine_name,
    expiry_date: m.expiry_date,
    stock_quantity: m.stock_quantity,
  }))

  return {
    medicineCount: medicineCount ?? 0,
    customerCount: customerCount ?? 0,
    monthlyRevenue,
    lowStock,
    expiringMeds,
    recentSales: recentSales ?? [],
  }
}
