import { notFound } from 'next/navigation'
import { getMedicine } from '@/lib/actions/medicines'
import { listCategories } from '@/lib/actions/categories'
import { MedicineForm } from '@/components/medicines/medicine-form'
import type { Tables } from '@/types/database.types'

export default async function MedicinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: medicine }, { data: categories }] = await Promise.all([
    getMedicine(id),
    listCategories(),
  ])

  if (!medicine) notFound()

  const med = medicine as Tables<'medicines'>

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Medicine</h1>
        <p className="text-sm text-muted-foreground">{med.name}</p>
      </div>
      <MedicineForm
        medicine={med}
        categories={categories as Tables<'categories'>[]}
      />
    </div>
  )
}
