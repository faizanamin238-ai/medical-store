import { listMedicines } from '@/lib/actions/medicines'
import { POSTerminal } from '@/components/pos/pos-terminal'

export default async function PointOfSalePage() {
  const { data: medicines } = await listMedicines()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Point of Sale</h1>
        <p className="text-sm text-muted-foreground mt-1">Search a medicine to add it to the cart</p>
      </div>
      <POSTerminal medicines={medicines} />
    </div>
  )
}
