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
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Plus, ArrowUpDown } from 'lucide-react'
import type { PurchaseWithSupplier } from '@/lib/actions/purchases'

function paymentBadge(status: string) {
  if (status === 'paid') return <Badge variant="outline" className="border-green-500 text-green-600">Paid</Badge>
  if (status === 'partial') return <Badge variant="outline" className="border-orange-400 text-orange-600">Partial</Badge>
  return <Badge variant="outline" className="border-red-400 text-red-600">Unpaid</Badge>
}

export function PurchaseTable({ data }: { data: PurchaseWithSupplier[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<PurchaseWithSupplier>[] = [
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
      cell: ({ row }) => row.original.invoice_number ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'invoice_date',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
    },
    {
      accessorKey: 'suppliers',
      header: 'Supplier',
      cell: ({ row }) => row.original.suppliers?.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => row.original.total_amount != null
        ? row.original.total_amount.toFixed(2)
        : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'paid_amount',
      header: 'Paid',
      cell: ({ row }) => row.original.paid_amount.toFixed(2),
    },
    {
      accessorKey: 'payment_status',
      header: 'Status',
      cell: ({ row }) => paymentBadge(row.original.payment_status),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link
          href={`/purchases/${row.original.id}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <Eye className="h-4 w-4" />
        </Link>
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
          placeholder="Search purchases..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/purchases/new" className={buttonVariants({ variant: 'default' })}>
          <Plus className="h-4 w-4" />
          New Purchase
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
                  No purchases found. Create your first purchase invoice.
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
        {table.getFilteredRowModel().rows.length} of {data.length} purchases
      </p>
    </div>
  )
}
