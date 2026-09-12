import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ShoppingBag } from '../components/icons'

export default function LoginPage() {
  const login = useStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="mb-10 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur-sm">
            <ShoppingBag size={24} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Shein Shop <span className="text-white/80">Link</span>
          </span>
        </Link>

        <div className="rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email address</label>
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base font-bold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Register as customer
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Want to sell with us?{' '}
              <Link to="/register/reseller" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Become a reseller
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
