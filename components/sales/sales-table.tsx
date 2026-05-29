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
import { Eye, ArrowUpDown } from 'lucide-react'
import type { SaleRow } from '@/lib/actions/sales'

function methodBadge(method: string | null) {
  if (!method) return null
  const map: Record<string, string> = { cash: 'Cash', card: 'Card', bank_transfer: 'Bank Transfer', other: 'Other' }
  return <Badge variant="outline">{map[method] ?? method}</Badge>
}

export function SalesTable({ data }: { data: SaleRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<SaleRow>[] = [
    {
      accessorKey: 'sale_date',
      header: ({ column }) => (
        <button className="flex items-center gap-1" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => row.original.sale_date.slice(0, 16).replace('T', ' '),
    },
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
      cell: ({ row }) => row.original.invoice_number ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'customers',
      header: 'Customer',
      cell: ({ row }) => row.original.customers?.name ?? <span className="text-muted-foreground">Walk-in</span>,
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment',
      cell: ({ row }) => methodBadge(row.original.payment_method),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => row.original.total != null ? row.original.total.toFixed(2) : '—',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link href={`/sales/${row.original.id}`} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
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
      <Input
        placeholder="Search sales..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

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
                  No sales yet.
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
        {table.getFilteredRowModel().rows.length} of {data.length} sales
      </p>
    </div>
  )
}
