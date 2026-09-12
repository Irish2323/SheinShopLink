import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ShoppingBag } from '../components/icons'

const DEMOS = [
  { label: 'Admin', email: 'admin@resellhub.ph', password: 'admin123', color: 'bg-brand-600' },
  { label: 'Reseller — Ana', email: 'ana@reseller.ph', password: 'reseller123', color: 'bg-emerald-600' },
  { label: 'Reseller — Jane', email: 'jane@reseller.ph', password: 'reseller123', color: 'bg-sky-600' },
  { label: 'Customer', email: 'customer@example.com', password: 'customer123', color: 'bg-ink-600' },
]

export default function LoginPage() {
  const login = useStore((s) => s.login)
  const resetDemo = useStore((s) => s.resetDemo)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const trimmed = email.trim().toLowerCase()
      const user = useStore.getState().users.find(
        (u) => u.email.toLowerCase() === trimmed,
      )
      if (user && user.password !== password) {
        setLoading(false)
        setError('Invalid email or password.')
        return
      }
      if (user && !user.active) {
        setLoading(false)
        setError(
          user.role === 'reseller'
            ? 'Your reseller account is pending approval. Please wait for the admin to approve your registration.'
            : 'Your account has been deactivated. Please contact support.',
        )
        return
      }
      const ok = login(email, password)
      setLoading(false)
      if (ok) {
        const userId = useStore.getState().currentUserId
        const loggedInUser = useStore.getState().users.find((u) => u.id === userId)
        navigate(loggedInUser?.role === 'admin' ? '/admin' : loggedInUser?.role === 'reseller' ? '/reseller' : '/', { replace: true })
      } else {
        setError('Invalid email or password.')
      }
    }, 300)
  }

  const demoLogin = (demo: (typeof DEMOS)[number]) => {
    const ok = login(demo.email, demo.password)
    if (ok) {
      const user = useStore.getState().users.find((u) => u.email === demo.email)
      navigate(user?.role === 'admin' ? '/admin' : user?.role === 'reseller' ? '/reseller' : '/', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lift">
            <ShoppingBag size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-ink-900">
            Shein Shop <span className="text-brand-600">Link</span>
          </span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-extrabold text-ink-900">Sign in</h1>
          <p className="mb-6 text-sm text-ink-500">
            Welcome back — sign in below.
          </p>

          <div className="mb-6 grid grid-cols-2 gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                onClick={() => demoLogin(d)}
                className={`flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2.5 text-left text-sm font-semibold text-ink-700 transition hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.98]`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-white ${d.color}`}>
                  {d.label[0]}
                </span>
                {d.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-300">
            <div className="h-px flex-1 bg-ink-200" />
            <span>or sign in with email</span>
            <div className="h-px flex-1 bg-ink-200" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Register as customer
          </Link>
          {' · '}
          <Link to="/register/reseller" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Become a reseller
          </Link>
        </p>

        <div className="mt-3 text-center">
          <button
            onClick={() => {
              resetDemo()
              setResetMsg('Demo data restored.')
              setTimeout(() => setResetMsg(''), 2500)
            }}
            className="text-xs font-semibold text-ink-400 underline-offset-2 hover:text-brand-600 hover:underline"
          >
            Reset demo data
          </button>
          {resetMsg && <p className="mt-1 text-xs font-semibold text-emerald-600">{resetMsg}</p>}
        </div>
      </div>
    </div>
  )
}