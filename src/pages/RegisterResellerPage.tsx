import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ShoppingBag } from '../components/icons'

export default function RegisterResellerPage() {
  const registerReseller = useStore((s) => s.registerReseller)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const res = registerReseller(name, email, password)
    if (res.ok) {
      setSuccess(res.message)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } else {
      setError(res.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lift">
            <ShoppingBag size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-ink-900">
            ResellHub<span className="text-brand-600">PH</span>
          </span>
        </Link>

        <div className="card p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">🤝</span>
            <h1 className="text-xl font-extrabold text-ink-900">Become a Reseller</h1>
          </div>
          <p className="mb-6 text-sm text-ink-500">
            Register for a reseller account. The admin will review and approve your application before you can log in.
          </p>

          <form onSubmit={onSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                {success}
              </div>
            )}
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                placeholder="Ana Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="mt-1 text-[11px] text-ink-400">
                Use your active email — we'll send approval notifications here.
              </p>
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
              <p className="font-bold">How it works:</p>
              <ol className="mt-1 list-decimal pl-4 space-y-0.5">
                <li>Submit your registration</li>
                <li>Admin reviews your application</li>
                <li>Once approved, you can log in and start ordering at wholesale prices</li>
              </ol>
            </div>

            <button type="submit" className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700">
              Submit application
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
          {' · '}
          <Link to="/register" className="font-semibold text-ink-500 hover:text-ink-800">
            Register as customer
          </Link>
        </p>
      </div>
    </div>
  )
}