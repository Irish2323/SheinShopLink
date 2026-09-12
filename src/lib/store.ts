import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CartItem,
  CustomPrice,
  Order,
  OrderStatus,
  Product,
  User,
} from './types'
import {
  seedCustomPrices,
  seedOrders,
  seedProducts,
  seedUsers,
} from './seed'
import { effectivePrice } from './pricing'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase()

let orderSeq = 1006

function nextOrderId(): string {
  orderSeq += 1
  return `RH-${orderSeq}`
}

function cartKey(productId: string, size: string): string {
  return `${productId}__${size}`
}

export interface AppStore {
  users: User[]
  products: Product[]
  customPrices: CustomPrice[]
  orders: Order[]
  cart: CartItem[]
  currentUserId: string | null

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

  placeOrder: (notes?: string) => { ok: boolean; message: string }
  setOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void
  deleteOrder: (orderId: string) => void

  resetDemo: () => void
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      products: seedProducts,
      customPrices: seedCustomPrices,
      orders: seedOrders,
      cart: [],
      currentUserId: null,

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
        return {
          ok: true,
          message: 'Registration submitted! The admin will review and approve your account. You can log in once approved.',
        }
      },

      addUser: (u) =>
        set((s) => ({ users: [...s.users, { ...u, id: uid() }] })),

      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),

      deleteUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          customPrices: s.customPrices.filter((cp) => cp.resellerId !== id),
        })),

      addProduct: (p) =>
        set((s) => ({
          products: [{ ...p, id: uid(), createdAt: Date.now() }, ...s.products],
        })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((prod) =>
            prod.id === id ? { ...prod, ...patch } : prod,
          ),
        })),

      deleteProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          customPrices: s.customPrices.filter((cp) => cp.productId !== id),
        })),

      setCustomPrice: (productId, resellerId, price) =>
        set((s) => {
          const exists = s.customPrices.some(
            (cp) => cp.productId === productId && cp.resellerId === resellerId,
          )
          const next: CustomPrice[] = exists
            ? s.customPrices.map((cp) =>
                cp.productId === productId && cp.resellerId === resellerId
                  ? { ...cp, price }
                  : cp,
              )
            : [...s.customPrices, { productId, resellerId, price }]
          return { customPrices: next }
        }),

      removeCustomPrice: (productId, resellerId) =>
        set((s) => ({
          customPrices: s.customPrices.filter(
            (cp) =>
              !(cp.productId === productId && cp.resellerId === resellerId),
          ),
        })),

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
            cart: qty <= 0
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

      placeOrder: (notes) => {
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
            const sizeOk = product.sizes?.some(
              (s) => s.name === c.size && s.available,
            ) ?? false
            if (!sizeOk) return null
            const unitPrice = user.role === 'reseller'
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
        const order: Order = {
          id: nextOrderId(),
          resellerId: user.id,
          resellerName: user.name,
          items,
          status: 'pending',
          notes: notes?.trim() || undefined,
          createdAt: Date.now(),
        }
        set((s) => ({ orders: [order, ...s.orders], cart: [] }))
        return { ok: true, message: `Order ${order.id} placed!` }
      },

      setOrderStatus: (orderId, status, reason) =>
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
        })),

      deleteOrder: (orderId) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== orderId) })),

      resetDemo: () =>
        set({
          users: seedUsers,
          products: seedProducts,
          customPrices: seedCustomPrices,
          orders: seedOrders,
          cart: [],
          currentUserId: 'u-admin',
        }),
    }),
    {
      name: 'resellhub-store',
      version: 4,
      migrate: (persisted: any, version: number) => {
        if (version < 4) {
          return {
            users: seedUsers,
            products: seedProducts,
            customPrices: seedCustomPrices,
            orders: seedOrders,
            cart: [],
            currentUserId: null,
          } as any
        }
        return persisted
      },
    },
  ),
)

export const getUser = (users: User[], id: string | null): User | null =>
  users.find((u) => u.id === id) ?? null