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
    supabase
      .from('medicines')
      .select('name,generic_name,category_id,stock_quantity,sale_price,purchase_price,unit,expiry_date,batch_number')
      .is('deleted_at', null),
    supabase
      .from('sales')
      .select('created_at,total,discount,tax,payment_method,sale_date'),
    supabase
      .from('customers')
      .select('name,phone,address,created_at')
      .is('deleted_at', null),
    supabase
      .from('suppliers')
      .select('name,contact_person,phone,email,address')
      .is('deleted_at', null),
    supabase
      .from('purchases')
      .select('created_at,total_amount,payment_status,invoice_number,invoice_date'),
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
