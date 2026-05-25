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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteCustomerDialog } from './delete-dialog'
import { Pencil, Plus, ArrowUpDown, Eye } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type CustomerRow = Tables<'customers'>

export function CustomerTable({ data }: { data: CustomerRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Since',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/customers/${row.original.id}`} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <Eye className="h-4 w-4" />
          </Link>
          <Link href={`/customers/${row.original.id}/edit`} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <Pencil className="h-4 w-4" />
          </Link>
          <DeleteCustomerDialog id={row.original.id} name={row.original.name} />
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
          placeholder="Search customers..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/customers/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                  No customers yet. Add your first customer.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} of {data.length} customers</p>
    </div>
  )
}
