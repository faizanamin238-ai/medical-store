'use server'

import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function exportAllData(): Promise<{
  medicines?: unknown[]
  sales?: unknown[]
  customers?: unknown[]
  suppliers?: unknown[]
  purchases?: unknown[]
  error?: string
}> {
  const supabase = await createClient()

  const [medicines, sales, customers, suppliers, purchases] = await Promise.all([
    supabase.from('medicines').select('name,generic_name,category_id,stock_quantity,sale_price,purchase_price,unit,expiry_date,batch_number').is('deleted_at', null),
    supabase.from('sales').select('created_at,total_amount,discount_amount,payment_method'),
    supabase.from('customers').select('name,phone,email,address,created_at'),
    supabase.from('suppliers').select('name,contact_person,phone,email,address'),
    supabase.from('purchases').select('created_at,total_amount,status'),
  ])

  if (medicines.error) return { error: medicines.error.message }

  await logAudit({ action: 'export', tableName: 'backup' })

  return {
    medicines: medicines.data ?? [],
    sales: sales.data ?? [],
    customers: customers.data ?? [],
    suppliers: suppliers.data ?? [],
    purchases: purchases.data ?? [],
  }
}
