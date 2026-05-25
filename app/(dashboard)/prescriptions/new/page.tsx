import { listCustomers } from '@/lib/actions/customers'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>
}) {
  const { customer_id } = await searchParams
  const { data: customers } = await listCustomers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Prescription</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a prescription image and record details</p>
      </div>
      <div className="max-w-2xl">
        <PrescriptionForm customers={customers} defaultCustomerId={customer_id} />
      </div>
    </div>
  )
}
