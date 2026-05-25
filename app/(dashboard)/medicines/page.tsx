import { listMedicines } from '@/lib/actions/medicines'
import { listCategories } from '@/lib/actions/categories'
import { MedicineTable } from '@/components/medicines/medicine-table'
import { CategoriesManager } from '@/components/medicines/categories-manager'
import { CSVImport } from '@/components/medicines/csv-import'
import type { Tables } from '@/types/database.types'
import type { MedicineWithCategory } from '@/lib/actions/medicines'

export default async function MedicinesPage() {
  const [{ data: medicines }, { data: categories }] = await Promise.all([
    listMedicines(),
    listCategories(),
  ])

  const expiringSoon = medicines.filter((m) => {
    if (!m.expiry_date) return false
    const days = Math.ceil((new Date(m.expiry_date).getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 30
  })

  const lowStock = medicines.filter(
    (m) => m.stock_quantity > 0 && m.stock_quantity <= m.reorder_level
  )

  const outOfStock = medicines.filter((m) => m.stock_quantity === 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medicines</h1>
          <p className="text-sm text-muted-foreground">{medicines.length} medicines total</p>
        </div>
        <div className="flex gap-2">
          <CategoriesManager categories={categories as Tables<'categories'>[]} />
          <CSVImport />
        </div>
      </div>

      {(expiringSoon.length > 0 || lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {outOfStock.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Out of stock</p>
              <p className="text-2xl font-bold text-red-700">{outOfStock.length}</p>
              <p className="text-xs text-red-600">{outOfStock.slice(0, 3).map(m => m.name).join(', ')}{outOfStock.length > 3 ? '…' : ''}</p>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-orange-800">Low stock</p>
              <p className="text-2xl font-bold text-orange-700">{lowStock.length}</p>
              <p className="text-xs text-orange-600">{lowStock.slice(0, 3).map(m => m.name).join(', ')}{lowStock.length > 3 ? '…' : ''}</p>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800">Expiring in 30 days</p>
              <p className="text-2xl font-bold text-yellow-700">{expiringSoon.length}</p>
              <p className="text-xs text-yellow-600">{expiringSoon.slice(0, 3).map(m => m.name).join(', ')}{expiringSoon.length > 3 ? '…' : ''}</p>
            </div>
          )}
        </div>
      )}

      <MedicineTable data={medicines as MedicineWithCategory[]} />
    </div>
  )
}
