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
            <h1 className="text-2xl font-extrabold text-gray-900">Create account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign up to start shopping
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 ring-1 ring-red-100">
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
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3 text-base font-bold">
              Create account
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
