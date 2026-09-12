import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../lib/store'
import { roleLabel } from '../lib/pricing'
import { LayoutIcon, LogOut, Menu, Package, ShoppingBag, Tag, TrendingUp, Users, X, Calculator, Sparkles } from './icons'

const navFor = (role: 'admin' | 'reseller' | 'customer' | null, cartCount: number, pendingOrders: number) => {
  if (role === 'admin') {
    return [
      { to: '/admin', label: 'Dashboard', icon: LayoutIcon },
      { to: '/admin/products', label: 'Products', icon: Package, badge: 0 },
      { to: '/admin/resellers', label: 'Resellers', icon: Users },
      { to: '/admin/pricing', label: 'Pricing', icon: Tag },
      {
        to: '/admin/orders',
        label: 'Orders',
        icon: ShoppingBag,
        badge: pendingOrders,
      },
      { to: '/admin/sales', label: 'Sales', icon: TrendingUp },
    ]
  }
  if (role === 'reseller') {
    return [
      { to: '/reseller', label: 'Catalog', icon: Sparkles },
      { to: '/reseller/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
      { to: '/reseller/orders', label: 'My Orders', icon: Package },
      { to: '/reseller/profit', label: 'Profit', icon: Calculator },
    ]
  }
  if (role === 'customer') {
    return [
      { to: '/', label: 'Shop', icon: Sparkles },
      { to: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
      { to: '/my-orders', label: 'My Orders', icon: Package },
    ]
  }
  return [{ to: '/', label: 'Shop', icon: Sparkles }]
}

export default function Layout() {
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId))
  const cart = useStore((s) => s.cart)
  const orders = useStore((s) => s.orders)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const role: 'admin' | 'reseller' | 'customer' | null =
    user?.role === 'admin' || user?.role === 'reseller' || user?.role === 'customer'
      ? user.role
      : null
  const cartCount = cart.reduce((n, c) => n + c.quantity, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const nav = navFor(role, cartCount, pendingOrders)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-50 text-brand-700 shadow-sm'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
    }`

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                <ShoppingBag size={18} />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-extrabold tracking-tight text-gray-900">
                  Shein Shop <span className="text-brand-600">Link</span>
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-gray-400 sm:block">
                  Online Products
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/' || item.to === '/admin' || item.to === '/reseller'} className={linkCls}>
                <item.icon size={16} />
                {item.label}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="ml-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse-soft">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden items-center gap-2.5 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white shadow-md">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-[11px] font-medium text-brand-600">{roleLabel(user.role)}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Log out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden btn-secondary sm:inline-flex">
                  Log in
                </Link>
                <Link to="/login" className="btn-primary">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-gray-200/60 bg-white/95 backdrop-blur-xl px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.to === '/admin' || item.to === '/reseller'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              {user && (
                <button onClick={handleLogout} className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={17} /> Log out
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <p className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          By proceeding, you agree to Shein Shop Link Terms of Use and Privacy Policy.
        </p>
      </footer>
    </div>
  )
}
