import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ShoppingBag } from '../components/icons'

export default function RegisterPage() {
  const registerCustomer = useStore((s) => s.registerCustomer)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const res = registerCustomer(name, email, password)
    if (res.ok) {
      navigate('/', { replace: true })
    } else {
      setError(res.message)
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
            ResellHub<span className="text-brand-600">PH</span>
          </span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-extrabold text-ink-900">Sign up</h1>
          <p className="mb-6 text-sm text-ink-500">
            Create a customer account to browse.
          </p>

          <form onSubmit={onSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary">
              Create account
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}