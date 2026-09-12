import { supabase } from './supabase'
import type { User, Product, CustomPrice, Order } from './types'

// ─── USERS ─────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return (data ?? []) as User[]
}

export async function createUser(user: User): Promise<void> {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
    active: user.active,
  })
  if (error) throw error
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<User, 'id'>>,
): Promise<void> {
  const { error } = await supabase.from('users').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
}

// ─── PRODUCTS ──────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToProduct)
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
  const { error } = await supabase.from('products').insert({
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
  if (error) throw error
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

  const { error } = await supabase.from('products').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── CUSTOM PRICES ─────────────────────────────────────

export async function fetchCustomPrices(): Promise<CustomPrice[]> {
  const { data, error } = await supabase.from('custom_prices').select('*')
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    productId: row.product_id,
    resellerId: row.reseller_id,
    price: row.price,
  }))
}

export async function upsertCustomPrice(cp: CustomPrice): Promise<void> {
  const { error } = await supabase
    .from('custom_prices')
    .upsert(
      { product_id: cp.productId, reseller_id: cp.resellerId, price: cp.price },
      { onConflict: 'product_id,reseller_id' },
    )
  if (error) throw error
}

export async function deleteCustomPrice(
  productId: string,
  resellerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('custom_prices')
    .delete()
    .eq('product_id', productId)
    .eq('reseller_id', resellerId)
  if (error) throw error
}

// ─── ORDERS ────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToOrder)
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
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    reseller_id: order.resellerId,
    reseller_name: order.resellerName,
    items: order.items,
    status: order.status,
    notes: order.notes ?? null,
    rejected_reason: order.rejectedReason ?? null,
    created_at: new Date(order.createdAt).toISOString(),
  })
  if (error) throw error
}

export async function updateOrder(
  id: string,
  patch: { status?: string; rejected_reason?: string | null },
): Promise<void> {
  const { error } = await supabase.from('orders').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// ─── META ──────────────────────────────────────────────

export async function getNextOrderSeq(): Promise<number> {
  const { data, error } = await supabase
    .from('meta')
    .select('order_seq')
    .eq('id', 'counters')
    .single()
  if (error) throw error
  const next = (data.order_seq ?? 1006) + 1
  const { error: upErr } = await supabase
    .from('meta')
    .update({ order_seq: next })
    .eq('id', 'counters')
  if (upErr) throw upErr
  return next
}
