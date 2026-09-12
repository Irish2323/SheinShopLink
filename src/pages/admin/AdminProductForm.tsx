import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { peso } from '../../lib/format'
import { DEFAULT_SIZES, type SizeOption, type StockType } from '../../lib/types'
import PageHeader from '../../components/PageHeader'
import { ArrowLeft, Edit, Plus, Trash, Upload } from '../../components/icons'

const CATEGORY_OPTIONS = ['Dresses', 'Tops', 'Bottoms', 'Sets', 'Outerwear', 'Shoes', 'Accessories']
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const inputCls = 'input'
const labelCls = 'label'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const products = useStore((s) => s.products)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)

  const editing = id ? products.find((p) => p.id === id) ?? null : null

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [variant, setVariant] = useState('')
  const [image, setImage] = useState('')
  const [sizes, setSizes] = useState<SizeOption[]>([])
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [available, setAvailable] = useState(true)
  const [stockType, setStockType] = useState<StockType>('on_hand')
  const [regularPrice, setRegularPrice] = useState('')
  const [resellerPrice, setResellerPrice] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [imgError, setImgError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (editing) {
      setName(editing.name)
      setDescription(editing.description)
      setCategory(editing.category)
      setVariant(editing.variant)
      setImage(editing.image)
      setSizes(editing.sizes.length > 0 ? editing.sizes : DEFAULT_SIZES.map((n) => ({ name: n, available: true })))
      setAvailable(editing.available)
      setStockType(editing.stockType ?? 'on_hand')
      setRegularPrice(String(editing.regularPrice))
      setResellerPrice(String(editing.defaultResellerPrice))
    } else {
      setName('')
      setDescription('')
      setCategory(CATEGORY_OPTIONS[0])
      setVariant('')
      setImage('')
      setSizes(DEFAULT_SIZES.map((n) => ({ name: n, available: true })))
      setAvailable(true)
      setStockType('on_hand')
      setRegularPrice('')
      setResellerPrice('')
    }
  }, [editing])

  const preview = useMemo(
    () => ({
      name: name || 'Product preview',
      description,
      category,
      variant,
      sizes,
      image,
      available,
      stockType,
      regularPrice: Number(regularPrice) || 0,
      defaultResellerPrice: Number(resellerPrice) || 0,
      createdAt: 0,
      id: 'preview',
    }),
    [name, description, category, variant, sizes, image, available, stockType, regularPrice, resellerPrice],
  )

  function readFile(file: File) {
    setImgError('')
    if (!file.type.startsWith('image/')) {
      setImgError('Please select an image file.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setImgError(`Image must be under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  function removeImage() {
    setImage('')
    setImgError('')
  }

  function toggleSize(name: string) {
    setSizes((prev) => {
      const exists = prev.find((s) => s.name === name)
      if (exists) {
        return prev.map((s) =>
          s.name === name ? { ...s, available: !s.available } : s,
        )
      }
      return [...prev, { name, available: true }]
    })
  }

  function addCustomSize() {
    const trimmed = customSizeInput.trim().toUpperCase()
    if (!trimmed) return
    if (sizes.some((s) => s.name === trimmed)) {
      setCustomSizeInput('')
      return
    }
    setSizes((prev) => [...prev, { name: trimmed, available: true }])
    setCustomSizeInput('')
  }

  function removeSize(name: string) {
    setSizes((prev) => prev.filter((s) => s.name !== name))
  }

  function setAllSizes(avail: boolean) {
    setSizes((prev) => prev.map((s) => ({ ...s, available: avail })))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const reg = Number(regularPrice)
    const res = Number(resellerPrice)
    if (!name.trim()) {
      setError('Product name is required.')
      return
    }
    if (!(reg > 0) || !(res > 0)) {
      setError('Please enter valid regular and reseller prices.')
      return
    }
    if (res >= reg) {
      setError('Reseller price should be lower than the regular customer price.')
      return
    }
    const availableSizes = sizes.filter((s) => s.available)
    if (availableSizes.length === 0) {
      setError('At least one size must be available.')
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      variant: variant.trim(),
      image: image.trim(),
      sizes,
      available,
      stockType,
      regularPrice: reg,
      defaultResellerPrice: res,
    }
    if (editing) {
      updateProduct(editing.id, payload)
    } else {
      addProduct(payload)
    }
    navigate('/admin/products')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <PageHeader
        title={editing ? 'Edit product' : 'Add product'}
        subtitle={editing ? `Editing ${editing.name}` : 'Create a new item for your resellers'}
      />

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* image upload */}
          <div className="card overflow-hidden">
            <p className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-ink-400">
              Product image
            </p>
            <div className="p-4">
              {image ? (
                <div className="group relative">
                  <img
                    src={image}
                    alt={name || 'Product preview'}
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-ink-950/0 opacity-0 transition group-hover:bg-ink-950/40 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow transition hover:bg-white"
                      title="Change image"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red-600 shadow transition hover:bg-white"
                      title="Remove image"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <span className="absolute right-2 top-2 rounded-full bg-ink-950/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    Uploaded
                  </span>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition ${
                    dragOver
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-ink-200 bg-ink-50 hover:border-brand-400 hover:bg-brand-50/50'
                  }`}
                >
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${dragOver ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-400'}`}>
                    <Upload size={26} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-700">
                      {dragOver ? 'Drop here' : 'Click or drag an image'}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      JPEG, PNG, WebP, GIF — up to {Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPT} onChange={handleFileChange} className="hidden" />
            <div className="border-t border-ink-100 px-4 py-3">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                Or paste image URL
              </label>
              <input
                className={inputCls}
                placeholder="https://…/dress.jpg"
                value={image.startsWith('data:') ? '' : image}
                onChange={(e) => { setImgError(''); setImage(e.target.value) }}
                disabled={image.startsWith('data:')}
              />
              {image.startsWith('data:') && (
                <p className="mt-1.5 text-[11px] text-ink-400">
                  File upload in use — remove it first to paste a URL.
                </p>
              )}
            </div>
            {imgError && (
              <div className="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {imgError}
              </div>
            )}
          </div>

          {/* sizes */}
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Sizes
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAllSizes(true)}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-200 hover:bg-emerald-50"
                >
                  All on
                </button>
                <button
                  type="button"
                  onClick={() => setAllSizes(false)}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-500 ring-1 ring-red-200 hover:bg-red-50"
                >
                  All off
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => toggleSize(s.name)}
                  className={`group relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    s.available
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-ink-100 text-ink-400 line-through'
                  }`}
                >
                  {s.name}
                  {s.available && (
                    <span className="text-[10px] opacity-70">✓</span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSize(s.name) }}
                    className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                    title="Remove size"
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Add custom size (e.g. 2XL, 3XL)"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize() } }}
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="btn-secondary shrink-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <p className="mt-2 text-[11px] text-ink-400">
              {sizes.filter((s) => s.available).length} of {sizes.length} sizes available.
              Unchecked sizes show as "out of stock" to resellers.
            </p>
          </div>

          {/* price preview */}
          <div className="card p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">
              Preview
            </p>
            <div className="flex items-center gap-3">
              {image ? <img src={image} alt="" className="h-14 w-14 rounded-lg object-cover" /> : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{preview.name}</p>
                <p className="text-lg font-extrabold text-brand-600">{peso(Number(regularPrice) || 0)}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {sizes.map((s) => (
                <span
                  key={s.name}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    s.available ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-400 line-through'
                  }`}
                >
                  {s.name}
                </span>
              ))}
              {sizes.length === 0 && (
                <span className="text-[11px] text-ink-400">No sizes added</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: form fields ── */}
        <div className="card space-y-5 p-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Product name</label>
            <input className={inputCls} placeholder="SHEIN Casual Floral Dress" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={`${inputCls} min-h-[90px] resize-y`} placeholder="Short description of the item…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Color / Variant</label>
              <input className={inputCls} placeholder="Black, Beige, 5 colors" value={variant} onChange={(e) => setVariant(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Stock type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStockType('on_hand')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition ${
                  stockType === 'on_hand'
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    stockType === 'on_hand' ? 'border-emerald-500 bg-emerald-500' : 'border-ink-300'
                  }`}>
                    {stockType === 'on_hand' && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm font-semibold text-ink-800">On Hand</span>
                </div>
                <p className="mt-1 ml-7 text-xs text-ink-400">Ready stock, ships immediately</p>
              </button>
              <button
                type="button"
                onClick={() => setStockType('pre_order')}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition ${
                  stockType === 'pre_order'
                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-200'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    stockType === 'pre_order' ? 'border-amber-500 bg-amber-500' : 'border-ink-300'
                  }`}>
                    {stockType === 'pre_order' && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-sm font-semibold text-ink-800">Pre-Order</span>
                </div>
                <p className="mt-1 ml-7 text-xs text-ink-400">Ordered from supplier after purchase</p>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Regular customer price (₱)</label>
              <input type="number" className={inputCls} placeholder="599" min={0} value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Default reseller price (₱)</label>
              <input type="number" className={inputCls} placeholder="499" min={0} value={resellerPrice} onChange={(e) => setResellerPrice(e.target.value)} />
            </div>
          </div>

          {Number(regularPrice) > 0 && Number(resellerPrice) > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
              <span className="font-semibold">Suggested reseller margin:</span>
              <span className="font-extrabold">{peso(Number(regularPrice) - Number(resellerPrice))}</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-800">Product availability</p>
              <p className="text-xs text-ink-400">Hidden items won't be orderable</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((v) => !v)}
              className={`h-6 w-11 rounded-full transition-colors ${available ? 'bg-brand-600' : 'bg-ink-200'}`}
            >
              <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${available ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
            <Link to="/admin/products" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}