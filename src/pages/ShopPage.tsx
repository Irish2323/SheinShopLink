import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { peso } from '../lib/format'
import { priceForRole } from '../lib/pricing'
import ProductImage from '../components/ProductImage'
import Modal from '../components/Modal'
import { Search, ShoppingBag } from '../components/icons'
import { STOCK_TYPE_LABEL } from '../lib/types'

export default function ShopPage() {
  const products = useStore((s) => s.products)
  const customPrices = useStore((s) => s.customPrices)
  const viewer = useStore((s) => s.users.find((u) => u.id === s.currentUserId))
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalSize, setModalSize] = useState<string | null>(null)
  const [addedMsg, setAddedMsg] = useState('')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  )

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchQ =
      !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    const matchC = category === 'All' || p.category === category
    return matchQ && matchC
  })

  const selected = products.find((p) => p.id === selectedId) ?? null
  const cartCount = cart.reduce((n, c) => n + c.quantity, 0)
  const isCustomer = viewer?.role === 'customer'
  const isLoggedIn = !!viewer

  function cartQtyFor(productId: string, size: string): number {
    return cart.find((c) => c.productId === productId && c.size === size)?.quantity ?? 0
  }

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 px-6 py-10 text-white sm:px-10">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
          New arrivals weekly
        </p>
        <h1 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Fresh SHEIN picks, straight from our catalog.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
          {isLoggedIn && isCustomer
            ? 'Select sizes and add items to your cart. We\'ll confirm your order shortly.'
            : 'Browse the full catalog with trusted retail prices. Sign in to start ordering.'}
        </p>
        {isLoggedIn && isCustomer && (
          <Link to="/cart" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-white/90 shadow-lg">
            <ShoppingBag size={16} /> My Cart
            {cartCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>
            )}
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
          <input
            className="input pl-10"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:text-ink-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">🛍️</p>
          <p className="mt-3 font-semibold text-ink-700">No products found</p>
          <p className="text-sm text-ink-400">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((p) => {
            const price = priceForRole(p, viewer ?? null, customPrices)
            const availableSizes = (p.sizes ?? []).filter((s) => s.available)
            return (
              <div key={p.id} className="card group overflow-hidden text-left transition duration-150 hover:-translate-y-1 hover:shadow-lift">
                <button
                  onClick={() => { setSelectedId(p.id); setModalSize(null) }}
                  className="block w-full"
                >
                  <div className="relative">
                    <ProductImage product={p} className="aspect-[4/5]" />
                    {!p.available && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                        Sold out
                      </span>
                    )}
                    {p.available && p.stockType === 'pre_order' && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                        Pre-Order
                      </span>
                    )}
                  </div>
                </button>
                <div className="p-3">
                  <button onClick={() => { setSelectedId(p.id); setModalSize(null) }} className="block w-full text-left">
                    <p className="truncate text-xs font-medium text-ink-400">{p.category}</p>
                    <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink-800">
                      {p.name}
                    </p>
                  </button>
                  <p className="mt-1.5 text-base font-extrabold text-ink-900">
                    {peso(price)}
                  </p>
                  {/* sizes on card */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(p.sizes ?? []).map((s) => (
                      <span
                        key={s.name}
                        className={`rounded px-1 py-0.5 text-[10px] font-bold ${
                          s.available ? 'bg-ink-100 text-ink-600' : 'bg-ink-50 text-ink-300 line-through'
                        }`}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                  {/* add to cart for logged-in customers */}
                  {isLoggedIn && isCustomer && p.available && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {availableSizes.map((s) => {
                        const inCart = cartQtyFor(p.id, s.name)
                        return (
                          <button
                            key={s.name}
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(p.id, s.name)
                              setAddedMsg(`${p.name} (${s.name}) added!`)
                              setTimeout(() => setAddedMsg(''), 2000)
                            }}
                            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                              inCart > 0
                                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                                : 'bg-ink-50 text-ink-600 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300'
                            }`}
                          >
                            {s.name}{inCart > 0 ? ` (${inCart})` : ''}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {addedMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lift animate-fade-up">
          {addedMsg}
        </div>
      )}

      {viewer?.role === 'reseller' && (
        <div className="card mt-8 flex flex-col items-center justify-between gap-3 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <ShoppingBag size={20} />
            </span>
            <p className="text-sm text-ink-600">
              You're signed in as a reseller — go to your{' '}
              <span className="font-bold text-emerald-600">private catalog</span> for wholesale prices.
            </p>
          </div>
          <Link to="/reseller" className="btn-primary">
            Go to my catalog
          </Link>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => { setSelectedId(null); setModalSize(null) }}
        title={selected?.name ?? ''}
        wide
      >
        {selected && (
          <div className="grid gap-5 sm:grid-cols-2">
            <ProductImage product={selected} className="aspect-square rounded-xl" />
            <div className="flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {selected.category}
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink-900">{selected.name}</p>
              <p className="mt-2 text-sm text-ink-600">{selected.description}</p>
              <div className="mt-3 rounded-xl bg-ink-50 p-3 text-sm">
                <p className="font-semibold text-ink-700">Variant</p>
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
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1.5">Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.sizes ?? []).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => s.available && setModalSize(s.name)}
                      disabled={!s.available}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        !s.available
                          ? 'cursor-not-allowed bg-ink-50 text-ink-300 line-through'
                          : modalSize === s.name
                            ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                            : 'bg-ink-50 text-ink-700 ring-1 ring-ink-200 hover:bg-brand-50 hover:ring-brand-300'
                      }`}
                    >
                      {s.name}{!s.available ? ' ✕' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Price</p>
                <p className="text-2xl font-extrabold text-ink-900">
                  {peso(priceForRole(selected, viewer ?? null, customPrices))}
                </p>
              </div>
              {isLoggedIn && isCustomer && selected.available ? (
                <button
                  onClick={() => {
                    if (modalSize) {
                      addToCart(selected.id, modalSize)
                      setModalSize(null)
                      setSelectedId(null)
                      setAddedMsg(`${selected.name} added to cart!`)
                      setTimeout(() => setAddedMsg(''), 2000)
                    }
                  }}
                  disabled={!modalSize}
                  className="btn-primary mt-4 w-full"
                >
                  <ShoppingBag size={16} />
                  {modalSize ? `Add size ${modalSize} to cart` : 'Select a size first'}
                </button>
              ) : (
                <p className="mt-auto pt-4 text-center text-sm text-ink-400">
                  {isLoggedIn ? 'This item is currently unavailable.' : 'Sign in as a customer to place an order.'}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}