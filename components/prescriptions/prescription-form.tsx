'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createPrescription } from '@/lib/actions/prescriptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tables } from '@/types/database.types'

interface PrescriptionFormProps {
  customers: Tables<'customers'>[]
  defaultCustomerId?: string
}

export function PrescriptionForm({ customers, defaultCustomerId }: PrescriptionFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? '')
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)
    formData.set('customer_id', customerId)

    startTransition(async () => {
      const result = await createPrescription(formData)
      if (result.error) {
        alert(result.error)
      } else {
        router.push(customerId ? `/customers/${customerId}` : '/prescriptions')
        router.refresh()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div className="space-y-1.5">
          <Label>Customer</Label>
          <Select value={customerId} onValueChange={(v: string | null) => setCustomerId(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No customer</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="doctor_name">Doctor name</Label>
          <Input id="doctor_name" name="doctor_name" placeholder="Dr. Smith" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prescription_date">Prescription date</Label>
          <Input id="prescription_date" name="prescription_date" type="date" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Any notes…" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="image">Prescription image</Label>
          <Input id="image" name="image" type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          {preview && (
            <div className="relative mt-2 h-48 rounded-md border overflow-hidden">
              <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
            </div>
          )}
        </div>

      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Uploading…' : 'Save prescription'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
