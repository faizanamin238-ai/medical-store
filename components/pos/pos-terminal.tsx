'use client'

import { useReducer, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, ShoppingCart, Pause, Play, CheckCircle } from 'lucide-react'
import { checkoutSale } from '@/lib/actions/sales'
import type { MedicineWithCategory } from '@/lib/actions/medicines'
import type { CartItem } from '@/lib/validators/sales'
import type { Tables } from '@/types/database.types'

interface CartLine extends CartItem {
  name: string
  unit: string
  stock_quantity: number
}

type CartAction =
  | { type: 'ADD'; medicine: MedicineWithCategory }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'SET_DISCOUNT'; id: string; discount: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; lines: CartLine[] }

function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((l) => l.medicine_id === action.medicine.id)
      if (existing) {
        return state.map((l) =>
          l.medicine_id === action.medicine.id
            ? { ...l, quantity: l.quantity + 1, total: (l.quantity + 1) * l.unit_price - l.discount }
            : l
        )
      }
      const line: CartLine = {
        medicine_id: action.medicine.id,
        name: action.medicine.name,
        unit: action.medicine.unit,
        stock_quantity: action.medicine.stock_quantity,
        quantity: 1,
        unit_price: action.medicine.sale_price,
        discount: 0,
        total: action.medicine.sale_price,
      }
      return [...state, line]
    }
    case 'SET_QTY': {
      return state.map((l) =>
        l.medicine_id === action.id
          ? { ...l, quantity: action.qty, total: action.qty * l.unit_price - l.discount }
          : l
      )
    }
    case 'SET_DISCOUNT': {
      return state.map((l) =>
        l.medicine_id === action.id
          ? { ...l, discount: action.discount, total: l.quantity * l.unit_price - action.discount }
          : l
      )
    }
    case 'REMOVE':
      return state.filter((l) => l.medicine_id !== action.id)
    case 'CLEAR':
      return []
    case 'LOAD':
      return action.lines
    default:
      return state
  }
}

const HOLD_KEY = 'pos_held_cart'

interface POSTerminalProps {
  medicines: MedicineWithCategory[]
  customers: Tables<'customers'>[]
}

export function POSTerminal({ medicines, customers }: POSTerminalProps) {
  const router = useRouter()
  const [cart, dispatch] = useReducer(cartReducer, [])
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'other'>('cash')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [heldCount, setHeldCount] = useState(0)

  useEffect(() => {
    try {
      const held = JSON.parse(localStorage.getItem(HOLD_KEY) ?? '[]')
      setHeldCount(Array.isArray(held) ? held.length : 0)
    } catch { /* ignore */ }
  }, [])

  const filtered = search.trim()
    ? medicines.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.barcode ?? '').includes(search) ||
        (m.generic_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : []

  const subtotal = cart.reduce((s, l) => s + l.total, 0)
  const grandTotal = subtotal - discount + tax

  const holdCart = useCallback(() => {
    if (cart.length === 0) return
    try {
      const held: CartLine[][] = JSON.parse(localStorage.getItem(HOLD_KEY) ?? '[]')
      held.push(cart)
      localStorage.setItem(HOLD_KEY, JSON.stringify(held))
      setHeldCount(held.length)
      dispatch({ type: 'CLEAR' })
      setDiscount(0)
      setTax(0)
    } catch { /* ignore */ }
  }, [cart])

  const resumeCart = useCallback(() => {
    try {
      const held: CartLine[][] = JSON.parse(localStorage.getItem(HOLD_KEY) ?? '[]')
      if (held.length === 0) return
      const last = held.pop()!
      localStorage.setItem(HOLD_KEY, JSON.stringify(held))
      setHeldCount(held.length)
      dispatch({ type: 'LOAD', lines: last })
    } catch { /* ignore */ }
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    const result = await checkoutSale({
      customer_id: selectedCustomerId,
      payment_method: paymentMethod,
      discount,
      tax,
      items: cart.map(({ medicine_id, quantity, unit_price, discount: d, total }) => ({
        medicine_id, quantity, unit_price, discount: d, total,
      })),
    })
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    setCheckoutOpen(false)
    dispatch({ type: 'CLEAR' })
    setDiscount(0)
    setTax(0)
    router.push(`/sales/${result.id}`)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">

      {/* Left: search + results */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Input
          autoFocus
          placeholder="Search by name, generic name, or barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search.trim() && (
          <div className="rounded-md border overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No medicines found.</p>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { dispatch({ type: 'ADD', medicine: m }); setSearch('') }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted border-b last:border-b-0 text-left"
                  disabled={m.stock_quantity === 0}
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    {m.generic_name && <p className="text-xs text-muted-foreground">{m.generic_name}</p>}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-semibold">{m.sale_price.toFixed(2)}</p>
                    {m.stock_quantity === 0
                      ? <Badge variant="destructive" className="text-xs">Out of stock</Badge>
                      : <p className="text-xs text-muted-foreground">{m.stock_quantity} {m.unit}</p>
                    }
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {!search.trim() && (
          <div className="flex-1 flex items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">Type to search medicines</p>
          </div>
        )}
      </div>

      {/* Right: cart */}
      <div className="flex flex-col flex-1 rounded-lg border overflow-hidden">

        {/* Customer selector */}
        <div className="px-4 py-2 border-b bg-muted/20">
          <Select onValueChange={(v: string | null) => setSelectedCustomerId(v || undefined)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Walk-in customer (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Walk-in</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Cart</span>
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {heldCount > 0 && (
              <Button variant="outline" size="sm" onClick={resumeCart}>
                <Play className="h-3 w-3" />
                Resume ({heldCount})
              </Button>
            )}
            {cart.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={holdCart}>
                  <Pause className="h-3 w-3" />
                  Hold
                </Button>
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'CLEAR' })}>
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Cart is empty</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Item</th>
                  <th className="px-3 py-2 text-center font-medium w-20">Qty</th>
                  <th className="px-3 py-2 text-right font-medium w-24">Price</th>
                  <th className="px-3 py-2 text-right font-medium w-24">Disc.</th>
                  <th className="px-3 py-2 text-right font-medium w-24">Total</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => (
                  <tr key={line.medicine_id} className="border-t">
                    <td className="px-3 py-2">
                      <p className="font-medium">{line.name}</p>
                      <p className="text-xs text-muted-foreground">{line.unit_price.toFixed(2)} / {line.unit}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        max={line.stock_quantity}
                        value={line.quantity}
                        onChange={(e) => dispatch({ type: 'SET_QTY', id: line.medicine_id, qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="h-7 w-16 text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">{line.unit_price.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.discount}
                        onChange={(e) => dispatch({ type: 'SET_DISCOUNT', id: line.medicine_id, discount: parseFloat(e.target.value) || 0 })}
                        className="h-7 w-20 text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{line.total.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => dispatch({ type: 'REMOVE', id: line.medicine_id })} className="text-destructive hover:opacity-70">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals + checkout */}
        <div className="border-t p-4 space-y-3 bg-muted/20">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm gap-4">
            <Label className="text-muted-foreground shrink-0">Order discount</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="h-7 w-28 text-right"
            />
          </div>

          <div className="flex items-center justify-between text-sm gap-4">
            <Label className="text-muted-foreground shrink-0">Tax</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              className="h-7 w-28 text-right"
            />
          </div>

          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>

          <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
            <DialogTrigger
              disabled={cart.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground h-10 px-4 font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              Checkout
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Payment method</Label>
                  <Select
                    defaultValue="cash"
                    onValueChange={(v: string | null) => setPaymentMethod((v ?? 'cash') as typeof paymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>-{discount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>+{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-base border-t pt-1 mt-1"><span>Total</span><span>{grandTotal.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                  <Button onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Processing…' : 'Confirm sale'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
