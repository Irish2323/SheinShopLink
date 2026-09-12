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
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
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
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              🤝
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Become a Reseller</h1>
            <p className="mt-2 text-sm text-gray-500">
              Register and wait for admin approval before you can start ordering.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 ring-1 ring-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-50 p-3.5 text-sm font-medium text-emerald-600 ring-1 ring-emerald-100">
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
              <p className="mt-1 text-[11px] text-gray-400">
                We'll send approval notifications to this email.
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

            <div className="rounded-xl bg-amber-50 p-3.5 text-xs text-amber-700 ring-1 ring-amber-100">
              <p className="font-bold">How it works:</p>
              <ol className="mt-1.5 list-decimal pl-4 space-y-1">
                <li>Submit your registration</li>
                <li>Admin reviews your application</li>
                <li>Once approved, you can log in and start ordering at wholesale prices</li>
              </ol>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700 btn py-3 text-base font-bold shadow-md">
              Submit application
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Just want to shop?{' '}
              <Link to="/register" className="font-semibold text-ink-500 hover:text-ink-800 transition-colors">
                Register as customer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
