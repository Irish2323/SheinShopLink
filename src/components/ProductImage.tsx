import { useState } from 'react'
import type { Product } from '../lib/types'
import { ChevronLeft, ChevronRight } from './icons'

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

function Placeholder({ product, className }: { product: Product; className?: string }) {
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

export default function ProductImage({
  product,
  className = 'aspect-[4/5]',
}: {
  product: Product
  className?: string
}) {
  const allImages = (product.images ?? []).filter(Boolean)
  const hasCarousel = allImages.length > 1

  if (!hasCarousel) {
    const src = allImages[0] || product.image
    if (src) {
      return (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          className={`w-full object-cover ${className}`}
        />
      )
    }
    return <Placeholder product={product} className={className} />
  }

  return (
    <Carousel images={allImages} alt={product.name} className={className} />
  )
}

function Carousel({
  images,
  alt,
  className = 'aspect-[4/5]',
}: {
  images: string[]
  alt: string
  className?: string
}) {
  const [idx, setIdx] = useState(0)

  function prev() {
    setIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function next() {
    setIdx((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <img
        src={images[idx]}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronRight size={14} />
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setIdx(i) }}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { Placeholder as ProductPlaceholder }
