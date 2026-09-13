import { db } from './supabase'
import type { User, Product, CustomPrice, Order } from './types'

// ─── USERS ─────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const data = await db.select('users', 'select=*')
  return (Array.isArray(data) ? data : []) as User[]
}

export async function createUser(user: User): Promise<void> {
  await db.insert('users', {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    active: user.active,
  })
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<User, 'id'>>,
): Promise<void> {
  await db.update('users', patch, `id=eq.${encodeURIComponent(id)}`)
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete('users', `id=eq.${encodeURIComponent(id)}`)
}

// ─── PRODUCTS ──────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const data = await db.select('products', 'select=*&order=created_at.desc')
  return (Array.isArray(data) ? data : []).map(rowToProduct)
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    variant: row.variant,
    sizes: row.sizes ?? [],
    image: row.image,
    available: row.available,
    stockType: row.stock_type,
    regularPrice: row.regular_price,
    defaultResellerPrice: row.default_reseller_price,
    createdAt: new Date(row.created_at).getTime(),
  }
}

export async function createProduct(product: Product): Promise<void> {
  await db.insert('products', {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    variant: product.variant,
    sizes: product.sizes,
    image: product.image,
    available: product.available,
    stock_type: product.stockType,
    regular_price: product.regularPrice,
    default_reseller_price: product.defaultResellerPrice,
    created_at: new Date(product.createdAt).toISOString(),
  })
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, 'id'>>,
): Promise<void> {
  const dbPatch: any = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.category !== undefined) dbPatch.category = patch.category
  if (patch.variant !== undefined) dbPatch.variant = patch.variant
  if (patch.sizes !== undefined) dbPatch.sizes = patch.sizes
  if (patch.image !== undefined) dbPatch.image = patch.image
  if (patch.available !== undefined) dbPatch.available = patch.available
  if (patch.stockType !== undefined) dbPatch.stock_type = patch.stockType
  if (patch.regularPrice !== undefined) dbPatch.regular_price = patch.regularPrice
  if (patch.defaultResellerPrice !== undefined)
    dbPatch.default_reseller_price = patch.defaultResellerPrice

  await db.update('products', dbPatch, `id=eq.${encodeURIComponent(id)}`)
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete('products', `id=eq.${encodeURIComponent(id)}`)
}

// ─── CUSTOM PRICES ─────────────────────────────────────

export async function fetchCustomPrices(): Promise<CustomPrice[]> {
  const data = await db.select('custom_prices', 'select=*')
  return (Array.isArray(data) ? data : []).map((row: any) => ({
    productId: row.product_id,
    resellerId: row.reseller_id,
    price: row.price,
  }))
}

export async function upsertCustomPrice(cp: CustomPrice): Promise<void> {
  await db.upsert(
    'custom_prices',
    { product_id: cp.productId, reseller_id: cp.resellerId, price: cp.price },
    'product_id,reseller_id',
  )
}

export async function deleteCustomPrice(
  productId: string,
  resellerId: string,
): Promise<void> {
  await db.delete(
    'custom_prices',
    `product_id=eq.${encodeURIComponent(productId)}&reseller_id=eq.${encodeURIComponent(resellerId)}`,
  )
}

// ─── ORDERS ────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const data = await db.select('orders', 'select=*&order=created_at.desc')
  return (Array.isArray(data) ? data : []).map(rowToOrder)
}

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    resellerId: row.reseller_id,
    resellerName: row.reseller_name,
    items: row.items ?? [],
    status: row.status,
    notes: row.notes ?? undefined,
    rejectedReason: row.rejected_reason ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  }
}

export async function createOrder(order: Order): Promise<void> {
  await db.insert('orders', {
    id: order.id,
    reseller_id: order.resellerId,
    reseller_name: order.resellerName,
    items: order.items,
    status: order.status,
    notes: order.notes ?? null,
    rejected_reason: order.rejectedReason ?? null,
    created_at: new Date(order.createdAt).toISOString(),
  })
}

export async function updateOrder(
  id: string,
  patch: { status?: string; rejected_reason?: string | null },
): Promise<void> {
  await db.update('orders', patch, `id=eq.${encodeURIComponent(id)}`)
}

export async function deleteOrder(id: string): Promise<void> {
  await db.delete('orders', `id=eq.${encodeURIComponent(id)}`)
}

// ─── META ──────────────────────────────────────────────

export async function getNextOrderSeq(): Promise<number> {
  const data = await db.select('meta', 'select=order_seq&id=eq.counters')
  const row = Array.isArray(data) ? data[0] : data
  const next = ((row as any)?.order_seq ?? 1006) + 1
  await db.update('meta', { order_seq: next }, 'id=eq.counters')
  return next
}
