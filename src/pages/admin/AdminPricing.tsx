import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { customPriceFor, isCustomPriced } from '../../lib/pricing'
import PageHeader from '../../components/PageHeader'
import ProductImage from '../../components/ProductImage'
import { Check, Search, Tag, Users } from '../../components/icons'

export default function AdminPricing() {
  const users = useStore((s) => s.users)
  const products = useStore((s) => s.products)
  const customPrices = useStore((s) => s.customPrices)
  const setCustomPrice = useStore((s) => s.setCustomPrice)
  const removeCustomPrice = useStore((s) => s.removeCustomPrice)

  const [params] = useSearchParams()
  const preselect = params.get('product') ?? ''

  const resellers = useMemo(
    () => users.filter((u) => u.role === 'reseller' && u.active),
    [users],
  )

  const [resellerId, setResellerId] = useState<string>(
    () => resellers[0]?.id ?? '',
  )
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const selectedReseller = resellers.find((r) => r.id === resellerId)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => !q || p.name.toLowerCase().includes(q))
    if (preselect) {
      list.sort((a, b) => (a.id === preselect ? -1 : b.id === preselect ? 1 : 0))
    }
    return list
  }, [products, query, preselect])

  const saveRow = (product: { id: string }) => {
    const raw = drafts[product.id]
    if (!raw) return
    const price = Number(raw)
    if (!(price > 0)) return
    setCustomPrice(product.id, resellerId, price)
    setDrafts((d) => {
      const next = { ...d }
      delete next[product.id]
      return next
    })
  }

  const resetRow = (productId: string) => {
    removeCustomPrice(productId, resellerId)
    setDrafts((d) => {
      const next = { ...d }
      delete next[productId]
      return next
    })
  }

  return (
    <div>
      <PageHeader
        title="Custom Reseller Pricing"
        subtitle="Set a unique price per reseller per product. Resellers only ever see their own price."
      />

      <div className="card mb-5 p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
          <Users size={14} /> Select reseller
        </p>
        <div className="flex flex-wrap gap-2">
          {resellers.map((r) => {
            const customCount = customPrices.filter((cp) => cp.resellerId === r.id).length
            return (
              <button
                key={r.id}
                onClick={() => {
                  setResellerId(r.id)
                  setDrafts({})
                }}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  resellerId === r.id
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900'
                }`}
              >
                {r.name}
                {customCount > 0 && (
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      resellerId === r.id ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {customCount}
                  </span>
                )}
              </button>
            )
          })}
          {resellers.length === 0 && (
            <p className="text-sm text-ink-400">No active resellers yet.</p>
          )}
        </div>
      </div>

      {selectedReseller && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
              <input
                className="input pl-10"
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-ink-500">
              Pricing for <span className="font-bold text-ink-900">{selectedReseller.name}</span>
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="tablehead">
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Regular</th>
                    <th className="text-right">Default Reseller</th>
                    <th className="text-right">Price for this reseller</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const custom = customPriceFor(customPrices, p.id, resellerId)
                    const draft = drafts[p.id]
                    const shown = draft !== undefined ? Number(draft) : (custom ?? p.defaultResellerPrice)
                    const hasCustom = isCustomPriced(customPrices, p.id, resellerId)
                    const dirty = draft !== undefined
                    const valid = shown > 0 && shown < p.regularPrice
                    return (
                      <tr key={p.id} className={`tablerow ${preselect === p.id ? 'bg-brand-50/50' : ''}`}>
                        <td>
                          <div className="flex items-center gap-3">
                            <ProductImage product={p} className="h-12 w-12 rounded-lg" />
                            <div className="leading-tight">
                              <p className="font-semibold text-ink-900">{p.name}</p>
                              <p className="text-xs text-ink-400">{p.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-semibold text-ink-700">{peso(p.regularPrice)}</td>
                        <td className="text-right font-semibold text-ink-500">{peso(p.defaultResellerPrice)}</td>
                        <td className="text-right">
                          <input
                            type="number"
                            min={0}
                            value={shown}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                            }
                            className={`w-28 rounded-lg border px-2.5 py-1.5 text-right text-sm font-bold ${!valid ? 'border-red-300 text-red-600' : 'border-ink-200'}`}
                          />
                          <span
                            className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                              hasCustom && !dirty
                                ? 'bg-brand-100 text-brand-700 ring-brand-200'
                                : dirty
                                  ? 'bg-amber-100 text-amber-700 ring-amber-200'
                                  : 'bg-ink-50 text-ink-400 ring-ink-100'
                            }`}
                          >
                            {dirty ? 'edited' : hasCustom ? 'custom' : 'default'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => (dirty ? saveRow(p) : undefined)}
                              disabled={!dirty || !valid}
                              className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Check size={13} /> Save
                            </button>
                            {hasCustom && (
                              <button
                                onClick={() => resetRow(p.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-500 ring-1 ring-ink-200 transition hover:bg-ink-50"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card mt-4 flex items-start gap-3 p-4 text-sm text-ink-600">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <Tag size={16} />
            </span>
            <p>
              Resellers with a <span className="font-bold text-brand-700">custom</span> price see
              that amount in their catalog. Otherwise they see the{' '}
              <span className="font-semibold text-ink-900">default reseller price</span>. They never
              see other resellers' numbers.
            </p>
          </div>
        </>
      )}
    </div>
  )
}