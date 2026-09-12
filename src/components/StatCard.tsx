import type { ReactNode } from 'react'

const TONES = {
  brand: 'from-brand-500 to-brand-700',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-400 to-orange-500',
  sky: 'from-sky-500 to-blue-600',
  rose: 'from-rose-400 to-pink-600',
  violet: 'from-violet-500 to-purple-600',
} as const

export default function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'brand',
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  tone?: keyof typeof TONES
}) {
  return (
    <div className="card p-5 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs font-medium text-ink-400">{hint}</p>}
        </div>
        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${TONES[tone]} text-white shadow-soft`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}