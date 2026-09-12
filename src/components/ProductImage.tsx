import type { Product } from '../lib/types'

const CATEGORY_EMOJI: Record<string, string> = {
  Dresses: '👗',
  Tops: '👚',
  Bottoms: '👖',
  Sets: '🧵',
  Outerwear: '🧥',
  Shoes: '👟',
  Accessories: '👜',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  Dresses: 'from-fuchsia-400 via-purple-500 to-violet-600',
  Tops: 'from-amber-400 via-orange-400 to-rose-500',
  Bottoms: 'from-sky-400 via-blue-500 to-indigo-600',
  Sets: 'from-emerald-400 via-teal-500 to-cyan-600',
  Outerwear: 'from-rose-400 via-pink-500 to-fuchsia-600',
  default: 'from-violet-400 via-purple-500 to-indigo-600',
}

let hashIdx = 0
function nextClass(): string {
  const palette = [
    'from-violet-400 via-purple-500 to-indigo-600',
    'from-fuchsia-400 via-pink-500 to-rose-500',
    'from-amber-400 via-orange-400 to-red-500',
    'from-teal-400 via-emerald-500 to-cyan-600',
    'from-sky-400 via-blue-500 to-indigo-600',
  ]
  const c = palette[hashIdx % palette.length]
  hashIdx += 1
  return c
}

export default function ProductImage({
  product,
  className = 'aspect-[4/5]',
}: {
  product: Product
  className?: string
}) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={`w-full object-cover ${className}`}
      />
    )
  }
  const gradient =
    CATEGORY_GRADIENT[product.category] ??
    CATEGORY_GRADIENT.default ??
    nextClass()
  return (
    <div
      className={`flex w-full items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
    >
      <span className="text-5xl opacity-90 drop-shadow-sm">
        {CATEGORY_EMOJI[product.category] ?? '🛍️'}
      </span>
    </div>
  )
}