import type { Order, Product, OrderStatus } from './types'

export interface DashboardMetrics {
  activeProducts: number
  availableProducts: number
  activeResellers: number
  pendingOrders: number
  totalRevenue: number
  totalResellerPurchases: number
  salesCount: number
  topReseller: { name: string; revenue: number } | null
  bestSelling: { name: string; units: number } | null
  recentOrders: Order[]
  statusCounts: Record<OrderStatus, number>
  revenueByDay: { label: string; value: number }[]
  perCategory: { category: string; count: number }[]
}

export function revenueOf(order: Order): number {
  return order.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
}

export function retailValueOf(order: Order): number {
  return order.items.reduce(
    (sum, it) => sum + it.retailPrice * it.quantity,
    0,
  )
}

export function profitOf(order: Order): number {
  return order.items.reduce(
    (sum, it) => sum + (it.retailPrice - it.unitPrice) * it.quantity,
    0,
  )
}

const MONEY_STATUSES: OrderStatus[] = ['ordered', 'arrived', 'completed']

export function computeMetrics(
  orders: Order[],
  products: Product[],
): DashboardMetrics {
  const activeResellers = orders.reduce((acc, o) => {
    acc.add(o.resellerId)
    return acc
  }, new Set<string>()).size

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    ordered: 0,
    arrived: 0,
    completed: 0,
    rejected: 0,
  }
  orders.forEach((o) => {
    statusCounts[o.status] += 1
  })

  const revenueOrders = orders.filter((o) => MONEY_STATUSES.includes(o.status))
  const totalRevenue = revenueOrders.reduce(
    (sum, o) => sum + revenueOf(o),
    0,
  )
  const salesCount = revenueOrders.length

  const resellerTotals = new Map<string, { name: string; revenue: number }>()
  revenueOrders.forEach((o) => {
    const cur = resellerTotals.get(o.resellerId) ?? {
      name: o.resellerName,
      revenue: 0,
    }
    cur.revenue += revenueOf(o)
    resellerTotals.set(o.resellerId, cur)
  })
  let topReseller: DashboardMetrics['topReseller'] = null
  resellerTotals.forEach((v) => {
    if (!topReseller || v.revenue > topReseller.revenue) {
      topReseller = { name: v.name, revenue: v.revenue }
    }
  })

  const productUnits = new Map<string, { name: string; units: number }>()
  revenueOrders.forEach((o) => {
    o.items.forEach((it) => {
      const cur = productUnits.get(it.productId) ?? {
        name: it.productName,
        units: 0,
      }
      cur.units += it.quantity
      productUnits.set(it.productId, cur)
    })
  })
  let bestSelling: DashboardMetrics['bestSelling'] = null
  productUnits.forEach((v) => {
    if (!bestSelling || v.units > bestSelling.units) {
      bestSelling = { name: v.name, units: v.units }
    }
  })

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const days: { label: string; value: number }[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const value = revenueOrders
      .filter((o) => o.createdAt >= d.getTime() && o.createdAt < next.getTime())
      .reduce((sum, o) => sum + revenueOf(o), 0)
    days.push({
      label: d.toLocaleDateString('en-PH', { weekday: 'short' }),
      value,
    })
  }

  const catMap = new Map<string, number>()
  products.forEach((p) => {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1)
  })
  const perCategory = Array.from(catMap.entries()).map(([category, count]) => ({
    category,
    count,
  }))

  return {
    activeProducts: products.length,
    availableProducts: products.filter((p) => p.available).length,
    activeResellers,
    pendingOrders: statusCounts.pending,
    totalRevenue,
    totalResellerPurchases: orders.reduce(
      (sum, o) => sum + revenueOf(o),
      0,
    ),
    salesCount,
    topReseller,
    bestSelling,
    recentOrders,
    statusCounts,
    revenueByDay: days,
    perCategory,
  }
}