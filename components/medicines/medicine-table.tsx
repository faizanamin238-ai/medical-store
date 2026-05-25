'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteMedicineDialog } from './delete-dialog'
import { buttonVariants } from '@/components/ui/button'
import { Pencil, Plus, ArrowUpDown } from 'lucide-react'
import type { MedicineWithCategory } from '@/lib/actions/medicines'

type MedicineRow = MedicineWithCategory

function stockBadge(qty: number, reorder: number) {
  if (qty === 0) return <Badge variant="destructive">Out of stock</Badge>
  if (qty <= reorder) return <Badge variant="outline" className="border-orange-400 text-orange-600">Low stock</Badge>
  return <Badge variant="outline" className="border-green-500 text-green-600">In stock</Badge>
}

function expiryBadge(date: string | null) {
  if (!date) return null
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0) return <Badge variant="destructive">Expired</Badge>
  if (days <= 30) return <Badge variant="outline" className="border-red-400 text-red-600">{days}d left</Badge>
  if (days <= 90) return <Badge variant="outline" className="border-orange-400 text-orange-600">{days}d left</Badge>
  return null
}

export function MedicineTable({ data }: { data: MedicineRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<MedicineRow>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.generic_name && (
            <p className="text-xs text-muted-foreground">{row.original.generic_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'categories',
      header: 'Category',
      cell: ({ row }) => row.original.categories?.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.stock_quantity} {row.original.unit}</span>
          {stockBadge(row.original.stock_quantity, row.original.reorder_level)}
        </div>
      ),
    },
    {
      accessorKey: 'sale_price',
      header: 'Sale Price',
      cell: ({ row }) => row.original.sale_price.toFixed(2),
    },
    {
      accessorKey: 'expiry_date',
      header: 'Expiry',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.expiry_date ?? '—'}</span>
          {expiryBadge(row.original.expiry_date)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/medicines/${row.original.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <DeleteMedicineDialog id={row.original.id} name={row.original.name} />
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search medicines..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/medicines/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="h-4 w-4" />
          Add Medicine
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  No medicines found. Add your first medicine.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} of {data.length} medicines
      </p>
    </div>
  )
}
