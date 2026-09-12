import { create } from 'zustand'
import type {
  CartItem,
  CustomPrice,
  Order,
  OrderStatus,
  Product,
  User,
} from './types'
import { effectivePrice } from './pricing'
import * as api from './api'
import { seedDatabase } from './seedSupabase'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase()

function cartKey(productId: string, size: string): string {
  return `${productId}__${size}`
}

export interface AppStore {
  initialized: boolean
  users: User[]
  products: Product[]
  customPrices: CustomPrice[]
  orders: Order[]
  cart: CartItem[]
  currentUserId: string | null

  hydrate: () => Promise<void>
  login: (email: string, password: string) => boolean
  loginAs: (userId: string) => boolean
  logout: () => void
  registerCustomer: (
    name: string,
    email: string,
    password: string,
  ) => { ok: boolean; message: string }
  registerReseller: (
    name: string,
    email: string,
    password: string,
  ) => { ok: boolean; message: string }

  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: string, patch: Partial<Omit<User, 'id'>>) => void
  deleteUser: (id: string) => void

  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void
  deleteProduct: (id: string) => void

  setCustomPrice: (productId: string, resellerId: string, price: number) => void
  removeCustomPrice: (productId: string, resellerId: string) => void

  addToCart: (productId: string, size: string) => void
  setCartQty: (productId: string, size: string, qty: number) => void
  removeFromCart: (productId: string, size: string) => void
  clearCart: () => void

  placeOrder: (notes?: string) => Promise<{ ok: boolean; message: string }>
  setOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void
  deleteOrder: (orderId: string) => void

  resetDemo: () => void
}

export const useStore = create<AppStore>()((set, get) => ({
  initialized: false,
  users: [],
  products: [],
  customPrices: [],
  orders: [],
  cart: [],
  currentUserId: null,

  hydrate: async () => {
    await seedDatabase()
    const [users, products, customPrices, orders] = await Promise.all([
      api.fetchUsers(),
      api.fetchProducts(),
      api.fetchCustomPrices(),
      api.fetchOrders(),
    ])
    set({ users, products, customPrices, orders, initialized: true })
  },

  login: (email, password) => {
    const user = get().users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!user || user.password !== password) return false
    if (!user.active) return false
    set({ currentUserId: user.id, cart: [] })
    return true
  },

  loginAs: (userId) => {
    const user = get().users.find((u) => u.id === userId)
    if (!user || !user.active) return false
    set({ currentUserId: user.id, cart: [] })
    return true
  },

  logout: () => set({ currentUserId: null, cart: [] }),

  registerCustomer: (name, email, password) => {
    const trimmed = email.trim().toLowerCase()
    if (get().users.some((u) => u.email.toLowerCase() === trimmed)) {
      return { ok: false, message: 'That email is already registered.' }
    }
    const user: User = {
      id: uid(),
      name: name.trim(),
      email: trimmed,
      password,
      role: 'customer',
      active: true,
    }
    set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
    api.createUser(user).catch(console.error)
    return { ok: true, message: 'Account created.' }
  },

  registerReseller: (name, email, password) => {
    const trimmed = email.trim().toLowerCase()
    if (get().users.some((u) => u.email.toLowerCase() === trimmed)) {
      return { ok: false, message: 'That email is already registered.' }
    }
    const user: User = {
      id: uid(),
      name: name.trim(),
      email: trimmed,
      password,
      role: 'reseller',
      active: false,
    }
    set((s) => ({ users: [...s.users, user] }))
    api.createUser(user).catch(console.error)
    return {
      ok: true,
      message:
        'Registration submitted! The admin will review and approve your account. You can log in once approved.',
    }
  },

  addUser: (u) => {
    const user = { ...u, id: uid() }
    set((s) => ({ users: [...s.users, user] }))
    api.createUser(user).catch(console.error)
  },

  updateUser: (id, patch) => {
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }))
    api.updateUser(id, patch).catch(console.error)
  },

  deleteUser: (id) => {
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
      customPrices: s.customPrices.filter((cp) => cp.resellerId !== id),
    }))
    api.deleteUser(id).catch(console.error)
  },

  addProduct: (p) => {
    const product: Product = { ...p, id: uid(), createdAt: Date.now() }
    set((s) => ({ products: [product, ...s.products] }))
    api.createProduct(product).catch(console.error)
  },

  updateProduct: (id, patch) => {
    set((s) => ({
      products: s.products.map((prod) =>
        prod.id === id ? { ...prod, ...patch } : prod,
      ),
    }))
    api.updateProduct(id, patch).catch(console.error)
  },

  deleteProduct: (id) => {
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
      customPrices: s.customPrices.filter((cp) => cp.productId !== id),
    }))
    api.deleteProduct(id).catch(console.error)
  },

  setCustomPrice: (productId, resellerId, price) => {
    const cp: CustomPrice = { productId, resellerId, price }
    set((s) => {
      const exists = s.customPrices.some(
        (c) => c.productId === productId && c.resellerId === resellerId,
      )
      const next: CustomPrice[] = exists
        ? s.customPrices.map((c) =>
            c.productId === productId && c.resellerId === resellerId
              ? { ...c, price }
              : c,
          )
        : [...s.customPrices, cp]
      return { customPrices: next }
    })
    api.upsertCustomPrice(cp).catch(console.error)
  },

  removeCustomPrice: (productId, resellerId) => {
    set((s) => ({
      customPrices: s.customPrices.filter(
        (c) => !(c.productId === productId && c.resellerId === resellerId),
      ),
    }))
    api.deleteCustomPrice(productId, resellerId).catch(console.error)
  },

  addToCart: (productId, size) =>
    set((s) => {
      const key = cartKey(productId, size)
      const existing = s.cart.find(
        (c) => cartKey(c.productId, c.size) === key,
      )
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            cartKey(c.productId, c.size) === key
              ? { ...c, quantity: c.quantity + 1 }
              : c,
          ),
        }
      }
      return { cart: [...s.cart, { productId, size, quantity: 1 }] }
    }),

  setCartQty: (productId, size, qty) =>
    set((s) => {
      const key = cartKey(productId, size)
      return {
        cart:
          qty <= 0
            ? s.cart.filter((c) => cartKey(c.productId, c.size) !== key)
            : s.cart.map((c) =>
                cartKey(c.productId, c.size) === key
                  ? { ...c, quantity: qty }
                  : c,
              ),
      }
    }),

  removeFromCart: (productId, size) =>
    set((s) => ({
      cart: s.cart.filter(
        (c) => cartKey(c.productId, c.size) !== cartKey(productId, size),
      ),
    })),

  clearCart: () => set({ cart: [] }),

  placeOrder: async (notes) => {
    const { currentUserId, users, cart, products, customPrices } = get()
    const user = users.find((u) => u.id === currentUserId)
    if (!user || (user.role !== 'reseller' && user.role !== 'customer')) {
      return { ok: false, message: 'Cannot place order — please sign in.' }
    }
    if (cart.length === 0) {
      return { ok: false, message: 'Your cart is empty.' }
    }
    const items = cart
      .map((c) => {
        const product = products.find((p) => p.id === c.productId)
        if (!product || !product.available) return null
        const sizeOk =
          product.sizes?.some((s) => s.name === c.size && s.available) ?? false
        if (!sizeOk) return null
        const unitPrice =
          user.role === 'reseller'
            ? effectivePrice(customPrices, product, user.id)
            : product.regularPrice
        return {
          productId: product.id,
          productName: product.name,
          size: c.size,
          variant: product.variant,
          image: product.image,
          quantity: c.quantity,
          unitPrice,
          retailPrice: product.regularPrice,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    if (items.length === 0) {
      return { ok: false, message: 'No available items in your cart.' }
    }

    const seq = await api.getNextOrderSeq()
    const orderId = `RH-${seq}`
    const order: Order = {
      id: orderId,
      resellerId: user.id,
      resellerName: user.name,
      items,
      status: 'pending',
      notes: notes?.trim() || undefined,
      createdAt: Date.now(),
    }
    set((s) => ({ orders: [order, ...s.orders], cart: [] }))
    api.createOrder(order).catch(console.error)
    return { ok: true, message: `Order ${order.id} placed!` }
  },

  setOrderStatus: (orderId, status, reason) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              rejectedReason: status === 'rejected' ? reason : undefined,
            }
          : o,
      ),
    }))
    api
      .updateOrder(orderId, {
        status,
        rejected_reason: status === 'rejected' ? (reason ?? null) : null,
      })
      .catch(console.error)
  },

  deleteOrder: (orderId) => {
    set((s) => ({ orders: s.orders.filter((o) => o.id !== orderId) }))
    api.deleteOrder(orderId).catch(console.error)
  },

  resetDemo: async () => {
    set({
      users: [],
      products: [],
      customPrices: [],
      orders: [],
      cart: [],
      currentUserId: 'u-admin',
    })
    await seedDatabase()
    const [users, products, customPrices, orders] = await Promise.all([
      api.fetchUsers(),
      api.fetchProducts(),
      api.fetchCustomPrices(),
      api.fetchOrders(),
    ])
    set({ users, products, customPrices, orders })
  },
}))

export const getUser = (users: User[], id: string | null): User | null =>
  users.find((u) => u.id === id) ?? null
