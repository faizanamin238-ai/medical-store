'server-only'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [
    { count: medicineCount },
    { count: customerCount },
    { data: monthlySales },
    { data: lowStock },
    { data: expiringMeds },
    { data: recentSales },
  ] = await Promise.all([
    supabase.from('medicines').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('sales').select('total').gte('created_at', startOfMonth),
    supabase
      .from('medicines')
      .select('id, name, stock_quantity, reorder_level')
      .filter('stock_quantity', 'lte', 'reorder_level')
      .order('stock_quantity', { ascending: true })
      .limit(5),
    supabase
      .from('medicines')
      .select('id, name, expiry_date, stock_quantity')
      .lte('expiry_date', thirtyDaysFromNow)
      .gt('stock_quantity', 0)
      .order('expiry_date', { ascending: true })
      .limit(5),
    supabase
      .from('sales')
      .select('id, total, payment_method, created_at, customers(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const monthlyRevenue = (monthlySales ?? []).reduce((sum, s) => sum + (s.total ?? 0), 0)

  return {
    medicineCount: medicineCount ?? 0,
    customerCount: customerCount ?? 0,
    monthlyRevenue,
    lowStock: lowStock ?? [],
    expiringMeds: expiringMeds ?? [],
    recentSales: recentSales ?? [],
  }
}
