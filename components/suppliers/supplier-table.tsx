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
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteSupplierDialog } from './delete-dialog'
import { Pencil, Plus, ArrowUpDown } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type SupplierRow = Tables<'suppliers'>

export function SupplierTable({ data }: { data: SupplierRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<SupplierRow>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact Person',
      cell: ({ row }) => row.original.contact_person ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'gst_number',
      header: 'GST No.',
      cell: ({ row }) => row.original.gst_number ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/suppliers/${row.original.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <DeleteSupplierDialog id={row.original.id} name={row.original.name} />
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
          placeholder="Search suppliers..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/suppliers/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="h-4 w-4" />
          Add Supplier
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
                  No suppliers found. Add your first supplier.
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
        {table.getFilteredRowModel().rows.length} of {data.length} suppliers
      </p>
    </div>
  )
}
