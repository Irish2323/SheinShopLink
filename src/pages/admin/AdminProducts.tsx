import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import ProductImage from '../../components/ProductImage'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import { Edit, Plus, Search, Tag, Trash } from '../../components/icons'
import { STOCK_TYPE_LABEL } from '../../lib/types'

export default function AdminProducts() {
  const products = useStore((s) => s.products)
  const updateProduct = useStore((s) => s.updateProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const customPrices = useStore((s) => s.customPrices)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q)
      const matchC = category === 'All' || p.category === category
      return matchQ && matchC
    })
  }, [products, query, category])

  const productToDelete = products.find((p) => p.id === confirmDelete)

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} total · ${products.filter((p) => p.available).length} available`}
        actions={
          <Link to="/admin/products/new" className="btn-primary">
            <Plus size={16} /> Add product
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
          <input className="input pl-10" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === c ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:text-ink-800'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => {
          const customCount = customPrices.filter((cp) => cp.productId === p.id).length
          const availableSizes = p.sizes?.filter((s) => s.available) ?? []
          return (
            <div key={p.id} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="relative">
                <ProductImage product={p} className="aspect-[4/3]" />
                {!p.available && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                    Hidden
                  </span>
                )}
                {p.available && (
                  <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur ${
                    p.stockType === 'pre_order' ? 'bg-amber-500/90' : 'bg-emerald-500/90'
                  }`}>
                    {STOCK_TYPE_LABEL[p.stockType]}
                  </span>
                )}
                {customCount > 0 && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand-700 ring-1 ring-brand-200 backdrop-blur">
                    <Tag size={11} /> {customCount} custom
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{p.category}</p>
                <p className="mt-0.5 line-clamp-1 font-semibold text-ink-900">{p.name}</p>
                {/* sizes */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {(p.sizes ?? []).map((s) => (
                    <span
                      key={s.name}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        s.available ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-400 line-through'
                      }`}
                      title={s.available ? 'In stock' : 'Out of stock'}
                    >
                      {s.name}
                    </span>
                  ))}
                  <span className="text-[10px] font-medium text-ink-400">
                    {availableSizes.length}/{p.sizes.length}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{p.variant}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="leading-tight">
                    <p className="text-[11px] font-semibold text-ink-400">Regular</p>
                    <p className="font-extrabold text-ink-900">{peso(p.regularPrice)}</p>
                  </div>
                  <div className="text-right leading-tight">
                    <p className="text-[11px] font-semibold text-emerald-600">Reseller</p>
                    <p className="font-extrabold text-emerald-600">{peso(p.defaultResellerPrice)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                  <button onClick={() => updateProduct(p.id, { available: !p.available })} className="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-600 ring-1 ring-ink-200 transition hover:bg-ink-50">
                    {p.available ? 'Hide' : 'Show'}
                  </button>
                  <Link to={`/admin/pricing?product=${p.id}`} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50">
                    Prices
                  </Link>
                  <Link to={`/admin/products/${p.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 ring-1 ring-ink-200 transition hover:bg-ink-50">
                    <Edit size={14} />
                  </Link>
                  <button onClick={() => setConfirmDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 ring-1 ring-red-200 transition hover:bg-red-50">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete product" footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => { if (confirmDelete) deleteProduct(confirmDelete); setConfirmDelete(null) }} className="btn-danger">Delete</button>
        </div>
      }>
        {productToDelete && (
          <p className="text-sm text-ink-600">
            Delete <span className="font-semibold text-ink-900">{productToDelete.name}</span>? This also removes any custom reseller prices for this product.
          </p>
        )}
      </Modal>
    </div>
  )
}