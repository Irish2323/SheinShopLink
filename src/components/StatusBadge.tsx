import type { OrderStatus } from '../lib/types'

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  ordered: 'bg-sky-100 text-sky-700 ring-sky-200',
  arrived: 'bg-violet-100 text-violet-700 ring-violet-200',
  completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-100 text-red-600 ring-red-200',
}

const LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  ordered: 'Ordered',
  arrived: 'Arrived',
  completed: 'Completed',
  rejected: 'Rejected',
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  )
}