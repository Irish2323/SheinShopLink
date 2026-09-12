import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { peso, fmtDateTime } from '../../lib/format'
import { revenueOf } from '../../lib/metrics'
import type { OrderStatus } from '../../lib/types'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import ProductImage from '../../components/ProductImage'
import { Check, Search, Trash, X } from '../../components/icons'

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

const NEXT_ACTION: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'ordered', label: 'Mark ordered' },
  ordered: { status: 'arrived', label: 'Mark arrived' },
  arrived: { status: 'completed', label: 'Mark completed' },
}

export default function AdminOrders() {
  const orders = useStore((s) => s.orders)
  const setOrderStatus = useStore((s) => s.setOrderStatus)
  const deleteOrder = useStore((s) => s.deleteOrder)

  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [viewId, setViewId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...orders]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((o) => {
        const matchF = filter === 'all' || o.status === filter
        const matchQ =
          !q ||
          o.id.toLowerCase().includes(q) ||
          o.resellerName.toLowerCase().includes(q)
        return matchF && matchQ
      })
  }, [orders, filter, query])

  const viewing = orders.find((o) => o.id === viewId) ?? null
  const rejecting = orders.find((o) => o.id === rejectId) ?? null

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length }
    orders.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1
    })
    return c
  }, [orders])

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Review, confirm, and process reseller orders"
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:text-ink-800'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.key ? 'text-white/70' : 'text-ink-300'}`}>
                {counts[f.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
          <input
            className="input pl-10"
            placeholder="Search order or reseller…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="tablehead">
              <tr>
                <th>Order</th>
                <th>Reseller</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="tablerow cursor-pointer" onClick={() => setViewId(o.id)}>
                  <td className="font-bold text-brand-600">{o.id}</td>
                  <td className="font-medium text-ink-800">{o.resellerName}</td>
                  <td className="text-ink-500">
                    {o.items.reduce((n, it) => n + it.quantity, 0)} pcs
                  </td>
                  <td className="font-bold text-ink-900">{peso(revenueOf(o))}</td>
                  <td className="text-ink-500">{fmtDateTime(o.createdAt)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="tablerow">
                  <td colSpan={6} className="py-10 text-center text-sm text-ink-400">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewId(null)}
        title={viewing ? `Order ${viewing.id}` : ''}
        wide
        footer={
          viewing && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={viewing.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {viewing.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      setViewId(null)
                      setRejectId(viewing.id)
                    }}
                    className="btn-danger"
                  >
                    <X size={15} /> Reject
                  </button>
                )}
                {NEXT_ACTION[viewing.status] && (
                  <button
                    onClick={() => setOrderStatus(viewing.id, NEXT_ACTION[viewing.status]!.status)}
                    className="btn-primary"
                  >
                    <Check size={15} /> {NEXT_ACTION[viewing.status]!.label}
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteOrder(viewing.id)
                    setViewId(null)
                  }}
                  className="btn-secondary text-red-500 ring-red-200 hover:bg-red-50"
                  title="Delete order"
                >
                  <Trash size={15} /> Delete
                </button>
              </div>
            </div>
          )
        }
      >
        {viewing && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Reseller</p>
                <p className="mt-0.5 text-sm font-bold text-ink-900">{viewing.resellerName}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Placed</p>
                <p className="mt-0.5 text-sm font-bold text-ink-900">{fmtDateTime(viewing.createdAt)}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Total</p>
                <p className="mt-0.5 text-sm font-extrabold text-ink-900">{peso(revenueOf(viewing))}</p>
              </div>
            </div>
            {viewing.notes && (
              <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
                <span className="font-bold">Notes: </span>
                {viewing.notes}
              </div>
            )}
            {viewing.rejectedReason && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                <span className="font-bold">Rejected: </span>
                {viewing.rejectedReason}
              </div>
            )}
            <div className="space-y-3">
              {viewing.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                  <ProductImage
                    product={{ id: it.productId, name: it.productName, category: '', image: it.image, createdAt: 0, available: true, stockType: 'on_hand' as const, variant: it.variant, sizes: [{ name: it.size, available: true }], description: '', regularPrice: it.retailPrice, defaultResellerPrice: it.unitPrice }}
                    className="h-14 w-14 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{it.productName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="inline-flex rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                        {it.size}
                      </span>
                      <span className="truncate text-xs text-ink-400">{it.variant}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink-900">
                      {peso(it.unitPrice)} × {it.quantity}
                    </p>
                    <p className="text-xs text-ink-400">
                      Retail {peso(it.retailPrice)} · qty {it.quantity}
                    </p>
                  </div>
                  <p className="w-20 text-right text-sm font-extrabold text-ink-900">
                    {peso(it.unitPrice * it.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject order"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setRejectId(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => {
                if (rejectId) setOrderStatus(rejectId, 'rejected', rejectReason.trim() || 'Rejected by admin')
                setRejectId(null)
                setRejectReason('')
              }}
              className="btn-danger"
            >
              Reject order
            </button>
          </div>
        }
      >
        {rejecting && (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">
              Reject order <span className="font-bold text-ink-900">{rejecting.id}</span> from{' '}
              <span className="font-semibold">{rejecting.resellerName}</span>?
            </p>
            <div>
              <label className="label">Reason (shown to reseller)</label>
              <input
                className="input"
                placeholder="e.g. Out of stock"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}