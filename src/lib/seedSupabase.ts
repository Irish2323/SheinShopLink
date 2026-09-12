import { supabase } from './supabase'
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
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
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
    const { error: uErr } = await supabase.from('users').insert(usersToInsert)
    if (uErr) throw new Error(`Users: ${uErr.message}`)

    const productsToInsert = seedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      variant: p.variant,
      sizes: p.sizes,
      image: p.image,
      available: p.available,
      stock_type: p.stockType,
      regular_price: p.regularPrice,
      default_reseller_price: p.defaultResellerPrice,
      created_at: new Date(p.createdAt).toISOString(),
    }))
    const { error: pErr } = await supabase.from('products').insert(productsToInsert)
    if (pErr) throw new Error(`Products: ${pErr.message}`)

    const cpToInsert = seedCustomPrices.map((cp) => ({
      product_id: cp.productId,
      reseller_id: cp.resellerId,
      price: cp.price,
    }))
    const { error: cpErr } = await supabase.from('custom_prices').insert(cpToInsert)
    if (cpErr) throw new Error(`Custom prices: ${cpErr.message}`)

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
    const { error: oErr } = await supabase.from('orders').insert(ordersToInsert)
    if (oErr) throw new Error(`Orders: ${oErr.message}`)

    const { error: mErr } = await supabase
      .from('meta')
      .insert({ id: 'counters', order_seq: 1006 })
    if (mErr) throw new Error(`Meta: ${mErr.message}`)

    return { ok: true, message: 'Database seeded.' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, message: `Seed failed: ${msg}` }
  }
}
