import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { effectivePrice } from '../../lib/pricing'
import ProductImage from '../../components/ProductImage'
import Modal from '../../components/Modal'
import { Search, ShoppingBag } from '../../components/icons'
import { STOCK_TYPE_LABEL } from '../../lib/types'

export default function ResellerCatalog() {
  const products = useStore((s) => s.products)
  const customPrices = useStore((s) => s.customPrices)
  const currentUserId = useStore((s) => s.currentUserId)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalSize, setModalSize] = useState<string | null>(null)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  )

  const available = useMemo(
    () => products.filter((p) => p.available),
    [products],
  )

  const filtered = available.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    const matchC = category === 'All' || p.category === category
    return matchQ && matchC
  })

  const selected = available.find((p) => p.id === selectedId) ?? null
  const selectedPrice = selected
    ? effectivePrice(customPrices, selected, currentUserId ?? undefined)
    : 0

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0)

  function cartQtyFor(productId: string, size: string): number {
    return cart.find((c) => c.productId === productId && c.size === size)?.quantity ?? 0
  }

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-gray-900 px-6 py-8 text-white sm:px-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/70">
          Private catalog
        </p>
        <h1 className="text-xl font-extrabold sm:text-2xl">Pick your sizes, set your quantity</h1>
        <p className="mt-1 max-w-xl text-sm text-white/70">
          Tap a size on any product to add it to your cart. Out-of-stock sizes are shown but can't be ordered.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
          <input className="input pl-10" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === c ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:text-ink-800'}`}>
                {c}
              </button>
            ))}
          </div>
          <Link to="/reseller/cart" className="relative flex items-center gap-2 rounded-xl bg-ink-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-ink-800">
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">🧺</p>
          <p className="mt-3 font-semibold text-ink-700">No available products</p>
          <p className="text-sm text-ink-400">Check back soon for new arrivals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const price = effectivePrice(customPrices, p, currentUserId ?? undefined)
            return (
              <div key={p.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                {/* image */}
                <button onClick={() => { setSelectedId(p.id); setModalSize(null) }} className="block w-full text-left">
                  <div className="relative">
                    <ProductImage product={p} className="aspect-[4/5]" />
                    {p.stockType === 'pre_order' && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
                        Pre-Order
                      </span>
                    )}
                    {customPrices.some((cp) => cp.productId === p.id && cp.resellerId === currentUserId) && (
                      <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
                        Your price
                      </span>
                    )}
                  </div>
                </button>

                <div className="p-3">
                  <button onClick={() => { setSelectedId(p.id); setModalSize(null) }} className="block w-full text-left">
                    <p className="truncate text-xs font-medium text-ink-400">{p.category}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink-800">{p.name}</p>
                  </button>

                  {/* price — only reseller's own price, no admin margin */}
                  <div className="mt-1.5">
                    <p className="text-[11px] font-semibold text-ink-400">Your price</p>
                    <p className="text-base font-extrabold text-emerald-600">{peso(price)}</p>
                  </div>

                  {/* size picker — like SHEIN */}
                  <div className="mt-2.5">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Select size
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(p.sizes ?? []).map((s) => {
                        const inCart = cartQtyFor(p.id, s.name)
                        return (
                          <button
                            key={s.name}
                            onClick={() => s.available && addToCart(p.id, s.name)}
                            disabled={!s.available}
                            className={`relative flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                              !s.available
                                ? 'cursor-not-allowed bg-ink-50 text-ink-300 line-through'
                                : inCart > 0
                                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                                  : 'bg-ink-50 text-ink-600 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300'
                            }`}
                            title={!s.available ? `${s.name} — out of stock` : `Add ${s.name} to cart`}
                          >
                            {s.name}
                            {!s.available && (
                              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                                ×
                              </span>
                            )}
                            {inCart > 0 && (
                              <span className="rounded bg-emerald-200 px-1 py-0.5 text-[9px] font-bold text-emerald-800">
                                {inCart}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* detail modal with size picker */}
      <Modal open={!!selected} onClose={() => { setSelectedId(null); setModalSize(null) }} title={selected?.name ?? ''} wide>
        {selected && (
          <div className="grid gap-5 sm:grid-cols-2">
            <ProductImage product={selected} className="aspect-square rounded-xl" />
            <div className="flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{selected.category}</p>
              <p className="mt-1 text-lg font-extrabold text-ink-900">{selected.name}</p>
              <p className="mt-2 text-sm text-ink-600">{selected.description}</p>
              <div className="mt-3 rounded-xl bg-ink-50 p-3 text-sm">
                <p className="font-semibold text-ink-700">Color / Variant</p>
                <p className="text-ink-500">{selected.variant}</p>
              </div>
              <div className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                selected.stockType === 'pre_order'
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {STOCK_TYPE_LABEL[selected.stockType]}
                {selected.stockType === 'pre_order' && <span className="text-amber-500">— may take 7–15 days</span>}
              </div>

              {/* size selector */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Choose size</p>
                <div className="flex flex-wrap gap-2">
                  {selected.sizes?.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => s.available && setModalSize(s.name)}
                      disabled={!s.available}
                      className={`flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        !s.available
                          ? 'cursor-not-allowed bg-ink-50 text-ink-300 line-through'
                          : modalSize === s.name
                            ? 'bg-brand-600 text-white shadow-soft ring-2 ring-brand-400'
                            : 'bg-ink-50 text-ink-700 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300'
                      }`}
                    >
                      {s.name}
                      {!s.available && <span className="text-[10px]">(out)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* price + add to cart */}
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-emerald-800">Your wholesale price</span>
                  <span className="font-extrabold text-emerald-700">{peso(selectedPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (modalSize) {
                    addToCart(selected.id, modalSize)
                    setModalSize(null)
                    setSelectedId(null)
                  }
                }}
                disabled={!modalSize}
                className="btn-primary mt-4 w-full"
              >
                <ShoppingBag size={16} />
                {modalSize ? `Add size ${modalSize} to cart` : 'Select a size first'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}