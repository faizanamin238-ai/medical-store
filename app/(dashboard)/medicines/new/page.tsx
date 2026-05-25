import { listCategories } from '@/lib/actions/categories'
import { MedicineForm } from '@/components/medicines/medicine-form'
import type { Tables } from '@/types/database.types'

export default async function NewMedicinePage() {
  const { data: categories } = await listCategories()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Medicine</h1>
        <p className="text-sm text-muted-foreground">Fill in the details to add a new medicine to your inventory.</p>
      </div>
      <MedicineForm categories={categories as Tables<'categories'>[]} />
    </div>
  )
}
