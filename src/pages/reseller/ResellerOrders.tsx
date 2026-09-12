import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso, fmtDateTime } from '../../lib/format'
import { profitOf, revenueOf } from '../../lib/metrics'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { Package, X } from '../../components/icons'

const STATUS_ORDER = ['pending', 'ordered', 'arrived', 'completed', 'rejected'] as const

export default function ResellerOrders() {
  const orders = useStore((s) => s.orders)
  const currentUserId = useStore((s) => s.currentUserId)
  const setOrderStatus = useStore((s) => s.setOrderStatus)

  const myOrders = useMemo(
    () =>
      orders
        .filter((o) => o.resellerId === currentUserId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [orders, currentUserId],
  )

  const [expanded, setExpanded] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle="Track the status of your orders"
        actions={
          <Link to="/reseller" className="btn-secondary">
            <Package size={16} /> Browse catalog
          </Link>
        }
      />

      {myOrders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-semibold text-ink-700">No orders placed yet</p>
          <p className="text-sm text-ink-400">Submit your first order from the catalog.</p>
          <Link to="/reseller" className="btn-primary mt-5">Start ordering</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((o) => {
            const isOpen = expanded === o.id
            return (
              <div key={o.id} className="card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-ink-50/60">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{o.id}</p>
                    <p className="text-xs text-ink-400">{fmtDateTime(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-ink-900">{peso(revenueOf(o))}</p>
                      <p className="text-xs font-semibold text-emerald-600">
                        +{peso(profitOf(o))} est. profit
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                </button>

                {o.rejectedReason && (
                  <div className="mx-5 mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                    <span className="font-bold">Rejected: </span>{o.rejectedReason}
                  </div>
                )}

                {isOpen && (
                  <div className="border-t border-ink-100 bg-ink-50/40 px-5 py-4">
                    {o.notes && (
                      <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                        <span className="font-bold">Your note: </span>{o.notes}
                      </p>
                    )}
                    <div className="divide-y divide-ink-100">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <div>
                            <p className="font-semibold text-ink-800">{it.productName}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="inline-flex rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                                {it.size}
                              </span>
                              <span className="text-xs text-ink-400">{it.variant}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-ink-900">{peso(it.unitPrice)} × {it.quantity}</p>
                            <p className="text-xs text-emerald-600">
                              sell {peso(it.retailPrice)} · earn {peso((it.retailPrice - it.unitPrice) * it.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-ink-100 pt-3 text-sm font-bold">
                      <span className="text-ink-600">Total you pay</span>
                      <span className="text-ink-900">{peso(revenueOf(o))}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm font-bold">
                      <span className="text-emerald-700">Estimated profit at retail</span>
                      <span className="text-emerald-600">{peso(profitOf(o))}</span>
                    </div>
                    {o.status === 'pending' && (
                      <button
                        onClick={() => { setCancelId(o.id); setCancelReason('') }}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <X size={15} /> Cancel order
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <div className="card flex items-start gap-3 p-4 text-sm text-ink-600">
            <span className="text-lg">💡</span>
            <div className="flex flex-wrap items-center gap-2">
              <span>Legend:</span>
              {STATUS_ORDER.map((s) => <StatusBadge key={s} status={s} />)}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel order"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setCancelId(null)} className="btn-secondary">Keep order</button>
            <button
              onClick={() => {
                if (cancelId) setOrderStatus(cancelId, 'rejected', cancelReason.trim() || 'Cancelled by reseller')
                setCancelId(null)
                setCancelReason('')
              }}
              className="btn-danger"
            >
              <X size={15} /> Cancel order
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">
          Are you sure you want to cancel order <span className="font-bold text-ink-900">{cancelId}</span>?
        </p>
        <div className="mt-3">
          <label className="label">Reason (optional)</label>
          <input
            className="input"
            placeholder="e.g. Found a better price elsewhere"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}