export type Role = 'admin' | 'reseller' | 'customer'

export type StockType = 'on_hand' | 'pre_order'

export type OrderStatus =
  | 'pending'
  | 'ordered'
  | 'arrived'
  | 'completed'
  | 'rejected'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  active: boolean
}

export interface SizeOption {
  name: string
  available: boolean
}

export const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export interface Product {
  id: string
  name: string
  description: string
  category: string
  variant: string
  sizes: SizeOption[]
  image: string
  images?: string[]
  available: boolean
  stockType: StockType
  regularPrice: number
  defaultResellerPrice: number
  createdAt: number
}

export interface CustomPrice {
  productId: string
  resellerId: string
  price: number
}

export interface CartItem {
  productId: string
  size: string
  quantity: number
}

export interface OrderItem {
  productId: string
  productName: string
  size: string
  variant: string
  image: string
  images?: string[]
  quantity: number
  unitPrice: number
  retailPrice: number
}

export interface Order {
  id: string
  resellerId: string
  resellerName: string
  items: OrderItem[]
  status: OrderStatus
  notes?: string
  rejectedReason?: string
  createdAt: number
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  ordered: 'Ordered',
  arrived: 'Arrived',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const ORDER_FLOW: OrderStatus[] = [
  'pending',
  'ordered',
  'arrived',
  'completed',
]

export function defaultSizes(): SizeOption[] {
  return DEFAULT_SIZES.map((name) => ({ name, available: true }))
}

export function sizesKey(productId: string, size: string): string {
  return `${productId}::${size}`
}

export const STOCK_TYPE_LABEL: Record<StockType, string> = {
  on_hand: 'On Hand',
  pre_order: 'Pre-Order',
}