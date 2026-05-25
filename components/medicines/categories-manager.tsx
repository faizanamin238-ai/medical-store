'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, deleteCategory } from '@/lib/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Tag } from 'lucide-react'
import type { Tables } from '@/types/database.types'

export function CategoriesManager({ categories }: { categories: Tables<'categories'>[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const result = await createCategory({ name: name.trim() })
    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else {
      setName('')
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
        <Tag className="h-4 w-4" />
        Categories
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage categories</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
          />
          <Button type="submit" disabled={loading || !name.trim()}>Add</Button>
        </form>

        <ul className="divide-y max-h-64 overflow-y-auto">
          {categories.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">No categories yet.</li>
          )}
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span className="text-sm">{c.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete(c.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
