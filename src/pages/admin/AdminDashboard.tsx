import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { computeMetrics, revenueOf } from '../../lib/metrics'
import { peso, timeAgo } from '../../lib/format'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../components/PageHeader'
import { LayoutIcon, Package, ShoppingBag, Sparkles, TrendingUp, Users } from '../../components/icons'

export default function AdminDashboard() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const m = computeMetrics(orders, products)

  const maxDay = Math.max(...m.revenueByDay.map((d) => d.value), 1)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your business at a glance"
        actions={
          <Link to="/admin/products/new" className="btn-primary">
            <Package size={16} /> Add product
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Products"
          value={m.activeProducts}
          hint={`${m.availableProducts} in stock`}
          icon={<Package size={18} />}
          tone="brand"
        />
        <StatCard
          label="Active Resellers"
          value={m.activeResellers}
          hint={`${m.pendingOrders} pending orders`}
          icon={<Users size={18} />}
          tone="emerald"
        />
        <StatCard
          label="Pending Orders"
          value={m.pendingOrders}
          hint={`${m.salesCount} sales processed`}
          icon={<ShoppingBag size={18} />}
          tone="amber"
        />
        <StatCard
          label="Total Sales"
          value={peso(m.totalRevenue)}
          hint={`${m.statusCounts.completed} completed`}
          icon={<TrendingUp size={18} />}
          tone="sky"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Sales — last 7 days</h2>
            <span className="text-xs font-semibold text-gray-400">
              {peso(m.totalRevenue)} total
            </span>
          </div>
          <div className="flex h-44 items-end gap-2 sm:gap-3">
            {m.revenueByDay.map((d) => (
              <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-300 group-hover:from-brand-700 group-hover:to-brand-500"
                    style={{ height: `${Math.max((d.value / maxDay) * 100, 4)}%` }}
                    title={peso(d.value)}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Best Selling Product
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {m.bestSelling ? m.bestSelling.name : '—'}
                </p>
                {m.bestSelling && (
                  <p className="text-xs font-semibold text-emerald-600">
                    {m.bestSelling.units} units sold
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <Users size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Top Reseller
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {m.topReseller ? m.topReseller.name : '—'}
                </p>
                {m.topReseller && (
                  <p className="text-xs font-semibold text-emerald-600">
                    {peso(m.topReseller.revenue)} in orders
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                <LayoutIcon size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Category Mix
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.perCategory.slice(0, 4).map((c) => (
                    <span
                      key={c.category}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600"
                    >
                      {c.category} · {c.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold text-gray-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="tablehead">
              <tr>
                <th>Order</th>
                <th>Reseller</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {m.recentOrders.map((o) => (
                <tr key={o.id} className="tablerow">
                  <td className="font-bold text-gray-900">
                    <Link to="/admin/orders" className="text-brand-600 hover:underline">
                      {o.id}
                    </Link>
                  </td>
                  <td className="font-medium text-gray-700">{o.resellerName}</td>
                  <td className="text-gray-500">{timeAgo(o.createdAt)}</td>
                  <td className="font-bold text-gray-900">{peso(revenueOf(o))}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {m.recentOrders.length === 0 && (
                <tr className="tablerow">
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
