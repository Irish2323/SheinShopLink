import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { effectivePrice } from '../../lib/pricing'
import ProductImage from '../../components/ProductImage'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { Calculator, TrendingUp } from '../../components/icons'

const inputCls = 'input'
const labelCls = 'label'

export default function ResellerProfit() {
  const products = useStore((s) => s.products)
  const customPrices = useStore((s) => s.customPrices)
  const currentUserId = useStore((s) => s.currentUserId)

  const available = useMemo(
    () => products.filter((p) => p.available),
    [products],
  )

  const [selectedId, setSelectedId] = useState<string>(available[0]?.id ?? '')
  const [sellingPrice, setSellingPrice] = useState('')

  const selected = available.find((p) => p.id === selectedId) ?? null
  const wholesale = selected
    ? effectivePrice(customPrices, selected, currentUserId ?? undefined)
    : 0

  useEffect(() => {
    if (selected) setSellingPrice(String(selected.regularPrice))
  }, [selectedId, selected])

  const sell = Number(sellingPrice) || 0
  const profit = sell - wholesale
  const marginPct = sell > 0 ? (profit / sell) * 100 : 0

  const rows = available.map((p) => {
    const cost = effectivePrice(customPrices, p, currentUserId ?? undefined)
    const est = p.regularPrice - cost
    const pct = (est / p.regularPrice) * 100
    return { product: p, cost, est, pct }
  })

  const avgPct =
    rows.length > 0 ? rows.reduce((s, r) => s + r.pct, 0) / rows.length : 0

  return (
    <div>
      <PageHeader
        title="Profit Calculator"
        subtitle="See how much you earn when you resell at your chosen price"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Your Wholesale Cost" value={selected ? peso(wholesale) : '—'} icon={<Calculator size={18} />} tone="brand" />
        <StatCard label="Suggested Retail" value={selected ? peso(sell) : '—'} icon={<Calculator size={18} />} tone="sky" />
        <StatCard label="Profit per Item" value={selected ? peso(profit) : '—'} icon={<TrendingUp size={18} />} tone="emerald" />
        <StatCard label="Profit Margin" value={`${marginPct.toFixed(1)}%`} icon={<TrendingUp size={18} />} tone="amber" />
      </div>

      <div className="card mt-6 p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className={labelCls}>Product</label>
            <select
              className={inputCls}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {peso(effectivePrice(customPrices, p, currentUserId ?? undefined))}
                </option>
              ))}
            </select>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-50 p-3.5">
              {selected && (
                <ProductImage product={selected} className="h-16 w-16 rounded-lg" />
              )}
              <div className="text-sm">
                <p className="font-bold text-ink-900">{selected?.name ?? '—'}</p>
                <p className="mt-0.5 block text-xs font-bold text-brand-600">
                  {peso(wholesale)}{' '}
                  <span className="font-medium text-ink-400">is your wholesale price</span>
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className={labelCls}>Your selling price to customers (₱)</label>
              <input
                type="number"
                className={inputCls}
                value={sellingPrice}
                min={0}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="e.g. 599"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                Suggested retail is {peso(selected?.regularPrice ?? 0)} — above your cost = profit.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            {selected && sell > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Your profit estimate
                </p>
                <p className={`mt-2 text-5xl font-extrabold tracking-tight ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {peso(profit)}
                  <span className="text-lg font-bold"> / item</span>
                </p>
                <p className={`mt-2 text-sm font-bold ${marginPct >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                  {marginPct.toFixed(1)}% margin
                </p>
                {profit < 0 && (
                  <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">
                    Selling below your wholesale price means a loss.
                  </p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="text-[11px] font-bold uppercase text-ink-400">Cost</p>
                    <p className="text-lg font-extrabold text-ink-900">{peso(wholesale)}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="text-[11px] font-bold uppercase text-ink-400">You sell at</p>
                    <p className="text-lg font-extrabold text-ink-900">{peso(sell)}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-emerald-700/70">
                  {profit > 0
                    ? `Sell ${Math.ceil(500 / profit)} pieces to earn ₱500 or more.`
                    : profit === 0
                      ? 'Selling at cost nets zero profit.'
                      : 'Selling below your wholesale price means a loss.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-bold text-ink-900">All products at retail price</h2>
          <p className="text-xs text-ink-400">
            Average margin across catalog: {avgPct.toFixed(0)}%
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="tablehead">
              <tr>
                <th>Product</th>
                <th className="text-right">Your Cost</th>
                <th className="text-right">Retail</th>
                <th className="text-right">Profit</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ product, cost, est, pct }) => (
                <tr key={product.id} className="tablerow">
                  <td className="font-semibold text-ink-800">{product.name}</td>
                  <td className="text-right font-bold text-ink-900">{peso(cost)}</td>
                  <td className="text-right text-ink-500">{peso(product.regularPrice)}</td>
                  <td className="text-right font-extrabold text-emerald-600">{peso(est)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-ink-500">{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}