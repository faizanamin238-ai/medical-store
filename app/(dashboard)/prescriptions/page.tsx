import Link from 'next/link'
import { listPrescriptions } from '@/lib/actions/prescriptions'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function PrescriptionsPage() {
  const { data: prescriptions } = await listPrescriptions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">All prescription records</p>
        </div>
        <Link href="/prescriptions/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="h-4 w-4" /> Add Prescription
        </Link>
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prescriptions on file yet.</p>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-md border p-4 text-sm flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {p.customers && (
                    <Link href={`/customers/${(p as { customer_id: string | null }).customer_id}`} className="font-medium hover:underline">
                      {p.customers.name}
                    </Link>
                  )}
                  {!p.customers && <span className="text-muted-foreground">Walk-in</span>}
                  {p.prescription_date && <span className="text-muted-foreground">· {p.prescription_date}</span>}
                </div>
                {p.doctor_name && <p className="text-muted-foreground">Dr. {p.doctor_name}</p>}
                {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
              </div>
              {p.image_url && (
                <a href={p.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0">
                  View image
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
