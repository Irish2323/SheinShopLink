import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { peso, fmtDate } from '../../lib/format'
import { profitOf, retailValueOf, revenueOf } from '../../lib/metrics'
import { ORDER_FLOW } from '../../lib/types'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import StatCard from '../../components/StatCard'
import { Package, TrendingUp, Users } from '../../components/icons'

export default function AdminSales() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)

  const salesOrders = useMemo(
    () =>
      [...orders]
        .filter((o) => ORDER_FLOW.includes(o.status))
        .sort((a, b) => b.createdAt - a.createdAt),
    [orders],
  )

  const totalRevenue = salesOrders.reduce((s, o) => s + revenueOf(o), 0)
  const totalRetail = salesOrders.reduce((s, o) => s + retailValueOf(o), 0)
  const totalProfit = salesOrders.reduce((s, o) => s + profitOf(o), 0)
  const units = salesOrders.reduce(
    (s, o) => s + o.items.reduce((n, it) => n + it.quantity, 0),
    0,
  )

  const perProduct = useMemo(() => {
    const map = new Map<
      string,
      { name: string; units: number; revenue: number; profit: number; category: string }
    >()
    salesOrders.forEach((o) => {
      o.items.forEach((it) => {
        const product = products.find((p) => p.id === it.productId)
        const cur = map.get(it.productId) ?? {
          name: it.productName,
          units: 0,
          revenue: 0,
          profit: 0,
          category: product?.category ?? 'Misc',
        }
        cur.units += it.quantity
        cur.revenue += it.unitPrice * it.quantity
        cur.profit += (it.retailPrice - it.unitPrice) * it.quantity
        map.set(it.productId, cur)
      })
    })
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [salesOrders, products])

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Revenue & profit across all orders"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sales Revenue" value={peso(totalRevenue)} icon={<TrendingUp size={18} />} tone="brand" />
        <StatCard label="Gross Retail Value" value={peso(totalRetail)} hint="what resellers sell for" icon={<Package size={18} />} tone="sky" />
        <StatCard label="Reseller Profit" value={peso(totalProfit)} hint="retail − reseller price" icon={<Users size={18} />} tone="emerald" />
        <StatCard label="Units Sold" value={units} hint={`${salesOrders.length} orders`} icon={<Package size={18} />} tone="amber" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="font-bold text-ink-900">Sales by product</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="tablehead">
                <tr>
                  <th>Product</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {perProduct.map((p) => (
                  <tr key={p.id} className="tablerow">
                    <td>
                      <p className="font-semibold text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-400">{p.category}</p>
                    </td>
                    <td className="text-right font-semibold text-ink-700">{p.units}</td>
                    <td className="text-right font-bold text-ink-900">{peso(p.revenue)}</td>
                    <td className="text-right font-bold text-emerald-600">{peso(p.profit)}</td>
                  </tr>
                ))}
                {perProduct.length === 0 && (
                  <tr className="tablerow">
                    <td colSpan={4} className="py-8 text-center text-sm text-ink-400">
                      No sales yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="font-bold text-ink-900">Order breakdown</h2>
          </div>
          <div className="divide-y divide-ink-100">
            {salesOrders.map((o) => {
              const expanded = expandedOrder === o.id
              const profit = profitOf(o)
              return (
                <div key={o.id}>
                  <button
                    onClick={() => setExpandedOrder(expanded ? null : o.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-ink-50/60"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink-900">
                        {o.id}{' '}
                        <span className="ml-1 font-medium text-ink-400">· {o.resellerName}</span>
                      </p>
                      <p className="text-xs text-ink-400">{fmtDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-900">{peso(revenueOf(o))}</p>
                        <p className="text-xs font-semibold text-emerald-600">+{peso(profit)} profit</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  </button>
                  {expanded && (
                    <div className="space-y-2 bg-ink-50/40 px-5 py-3">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-700">{it.productName}</p>
                            <p className="text-xs text-ink-400">
                              {peso(it.unitPrice)} × {it.quantity} · retail {peso(it.retailPrice)}
                            </p>
                          </div>
                          <p className="font-bold text-ink-900">{peso(it.unitPrice * it.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {salesOrders.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-400">
                No sales yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}