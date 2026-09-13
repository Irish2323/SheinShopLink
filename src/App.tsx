import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { useStore } from './lib/store'
import type { Role } from './lib/types'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterResellerPage from './pages/RegisterResellerPage'
import ShopPage from './pages/ShopPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminResellers from './pages/admin/AdminResellers'
import AdminPricing from './pages/admin/AdminPricing'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSales from './pages/admin/AdminSales'

import ResellerCatalog from './pages/reseller/ResellerCatalog'
import ResellerCart from './pages/reseller/ResellerCart'
import ResellerOrders from './pages/reseller/ResellerOrders'
import ResellerProfit from './pages/reseller/ResellerProfit'

import CustomerCart from './pages/customer/CustomerCart'
import CustomerOrders from './pages/customer/CustomerOrders'

function RequireRole({ role, also }: { role: Role; also?: Role[] }) {
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId))
  if (!user) return <Navigate to="/login" replace />
  const allowed = [role, ...(also ?? [])]
  if (allowed.includes(user.role)) return <Outlet />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function AppLoader({ children }: { children: React.ReactNode }) {
  const initialized = useStore((s) => s.initialized)
  const hydrate = useStore((s) => s.hydrate)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    hydrate().catch((err) => {
      console.error('[AppLoader] hydrate error:', err)
      setError(err?.message ?? 'Failed to connect to database.')
    })
  }, [hydrate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5]">
        <div className="max-w-md text-center animate-fade-up">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-lg">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">Connection Error</h2>
          <p className="mb-4 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => { setError(null); setRetrying(true); hydrate().catch((err) => { setError(err?.message ?? 'Failed'); setRetrying(false); }) }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5]">
        <div className="text-center animate-fade-up">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">Loading your store…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AppLoader>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ShopPage />} />

          <Route path="/admin" element={<RequireRole role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="resellers" element={<AdminResellers />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="sales" element={<AdminSales />} />
          </Route>

          <Route path="/reseller" element={<RequireRole role="reseller" />}>
            <Route index element={<ResellerCatalog />} />
            <Route path="cart" element={<ResellerCart />} />
            <Route path="orders" element={<ResellerOrders />} />
            <Route path="profit" element={<ResellerProfit />} />
          </Route>

          <Route
            path="/cart"
            element={<RequireRole role="customer" also={['reseller']} />}
          >
            <Route index element={<CustomerCart />} />
          </Route>
          <Route
            path="/my-orders"
            element={<RequireRole role="customer" also={['reseller']} />}
          >
            <Route index element={<CustomerOrders />} />
          </Route>
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/reseller" element={<RegisterResellerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLoader>
  )
}
