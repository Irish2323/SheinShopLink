import type { CustomPrice, Product, Role, User } from './types'

export function customPriceFor(
  customPrices: CustomPrice[],
  productId: string,
  resellerId: string,
): number | undefined {
  return customPrices.find(
    (cp) => cp.productId === productId && cp.resellerId === resellerId,
  )?.price
}

export function effectivePrice(
  customPrices: CustomPrice[],
  product: Product,
  resellerId: string | undefined,
): number {
  if (!resellerId) return product.regularPrice
  return (
    customPriceFor(customPrices, product.id, resellerId) ??
    product.defaultResellerPrice
  )
}

export function priceForRole(
  product: Product,
  viewer: User | null,
  customPrices: CustomPrice[],
): number {
  if (viewer?.role === 'reseller' && viewer.active) {
    return effectivePrice(customPrices, product, viewer.id)
  }
  return product.regularPrice
}

export function isCustomPriced(
  customPrices: CustomPrice[],
  productId: string,
  resellerId: string,
): boolean {
  return customPriceFor(customPrices, productId, resellerId) !== undefined
}

/** The role label shown next to a user's name. */
export function roleLabel(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'reseller':
      return 'Reseller'
    default:
      return 'Customer'
  }
}