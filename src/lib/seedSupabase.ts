import { db } from './supabase'
import {
  seedUsers,
  seedProducts,
  seedCustomPrices,
  seedOrders,
} from './seed'

export async function seedDatabase(): Promise<{
  ok: boolean
  message: string
}> {
  try {
    const count = await db.count('users')
    if (count > 0) {
      return { ok: true, message: 'Already seeded.' }
    }

    const usersToInsert = seedUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      active: u.active,
    }))
    await db.insert('users', usersToInsert)

    const productsToInsert = seedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      variant: p.variant,
      sizes: p.sizes,
      image: p.image,
      images: p.images ?? [],
      available: p.available,
      stock_type: p.stockType,
      regular_price: p.regularPrice,
      default_reseller_price: p.defaultResellerPrice,
      created_at: new Date(p.createdAt).toISOString(),
    }))
    await db.insert('products', productsToInsert)

    const cpToInsert = seedCustomPrices.map((cp) => ({
      product_id: cp.productId,
      reseller_id: cp.resellerId,
      price: cp.price,
    }))
    await db.insert('custom_prices', cpToInsert)

    const ordersToInsert = seedOrders.map((o) => ({
      id: o.id,
      reseller_id: o.resellerId,
      reseller_name: o.resellerName,
      items: o.items,
      status: o.status,
      notes: o.notes ?? null,
      rejected_reason: o.rejectedReason ?? null,
      created_at: new Date(o.createdAt).toISOString(),
    }))
    await db.insert('orders', ordersToInsert)

    await db.insert('meta', { id: 'counters', order_seq: 1006 })

    return { ok: true, message: 'Database seeded.' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, message: `Seed failed: ${msg}` }
  }
}
