import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { effectivePrice } from '../../lib/pricing'
import ProductImage from '../../components/ProductImage'
import PageHeader from '../../components/PageHeader'
import { AlertCircle, Minus, Plus, ShoppingBag, Trash } from '../../components/icons'

export default function ResellerCart() {
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const customPrices = useStore((s) => s.customPrices)
  const currentUserId = useStore((s) => s.currentUserId)
  const setCartQty = useStore((s) => s.setCartQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)
  const placeOrder = useStore((s) => s.placeOrder)

  const [notes, setNotes] = useState('')
  const [flash, setFlash] = useState('')

  const lines = useMemo(
    () =>
      cart
        .map((c) => {
          const product = products.find((p) => p.id === c.productId)
          if (!product) return null
          const unitPrice = effectivePrice(customPrices, product, currentUserId ?? undefined)
          return {
            product,
            size: c.size,
            quantity: c.quantity,
            unitPrice,
            lineTotal: unitPrice * c.quantity,
            retailValue: product.regularPrice * c.quantity,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [cart, products, customPrices, currentUserId],
  )

  const total = lines.reduce((s, l) => s + l.lineTotal, 0)

  const submit = async () => {
    const res = await placeOrder(notes)
    setFlash(res.message)
    if (res.ok) {
      setNotes('')
      setTimeout(() => setFlash(''), 4000)
    }
  }

  return (
    <div>
      <PageHeader
        title="Cart"
        subtitle="Review quantities and sizes, then submit your order"
        actions={<Link to="/reseller" className="btn-secondary">Keep browsing</Link>}
      />

      {flash && (
        <div className="card mb-5 flex items-center gap-3 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <AlertCircle size={18} /> {flash}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
            <ShoppingBag size={28} />
          </span>
          <p className="mt-4 font-bold text-ink-800">Your cart is empty</p>
          <p className="text-sm text-ink-400">Browse the catalog and add items to get started.</p>
          <Link to="/reseller" className="btn-primary mt-5">Browse catalog</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((l) => (
              <div key={`${l.product.id}__${l.size}`} className="card flex items-center gap-4 p-4">
                <ProductImage product={l.product} className="h-20 w-20 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{l.product.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                      Size: {l.size}
                    </span>
                    <span className="truncate text-xs text-ink-400">{l.product.variant}</span>
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-emerald-600">
                    {peso(l.unitPrice)} <span className="text-[11px] font-medium text-ink-400">each</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCartQty(l.product.id, l.size, l.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-ink-200 text-ink-500 hover:bg-ink-50">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-ink-900">{l.quantity}</span>
                  <button onClick={() => setCartQty(l.product.id, l.size, l.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-ink-200 text-ink-500 hover:bg-ink-50">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="w-24 text-right text-sm font-extrabold text-ink-900">{peso(l.lineTotal)}</p>
                <button onClick={() => removeFromCart(l.product.id, l.size)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 ring-1 ring-red-200 hover:bg-red-50">
                  <Trash size={14} />
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <button onClick={clearCart} className="text-xs font-semibold text-ink-400 hover:text-red-500">
                Clear cart
              </button>
            </div>
          </div>

          <div className="card h-fit p-5">
            <h2 className="mb-4 font-bold text-ink-900">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Total (you pay)</span>
                <span className="font-extrabold text-ink-900">{peso(total)}</span>
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Order notes (optional)</label>
              <textarea className="input min-h-[80px] resize-y" placeholder="Sizes, colors, or special instructions…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button onClick={submit} className="btn-primary mt-4 w-full">Submit order</button>
            <p className="mt-2 text-center text-[11px] text-ink-400">The admin will process your order and update you on the status.</p>
          </div>
        </div>
      )}
    </div>
  )
}