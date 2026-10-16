import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ShoppingCart, Zap, Loader2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'
import type { Product } from '@/types'
import {SEO} from '@/components/Seo/seo'

// ── Color name → hex map ──────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  'White':      '#FFFFFF',
  'Pink':       '#F4A7B9',
  'Black':      '#2C2C2C',
  'Yellow':     '#FBBF24',
  'Blue':       '#3B82F6',
  'Green':      '#22C55E',
  'Red':        '#EF4444',
  'Purple':     '#A855F7',
  'Orange':     '#F97316',
  'Gold':       '#F59E0B',
  'Silver':     '#9CA3AF',
  'Rose Gold':  '#FB7185',
  'Warm White': '#FEF3C7',
  'Cool White': '#EFF6FF',
  'Navy':       '#1E3A5F',
  'Brown':      '#92400E',
}

export default function ProductPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const showToast = useToastStore(s => s.showToast)

  // useCart handles all DB writes + local state sync
  const { addItem } = useCart()

  const [product,        setProduct]        = useState<Product | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [selectedColor,  setSelectedColor]  = useState<string>('')
  const [activeImage,    setActiveImage]    = useState(0)
  const [addingCart,     setAddingCart]     = useState(false)
  const [orderingNow,    setOrderingNow]    = useState(false)

  // ── Fetch product ─────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          showToast('Product not found', 'error')
          navigate('/')
          return
        }
        setProduct(data as Product)
        // Default to first color variant if available
        if (data.color_variants?.length > 0) {
          setSelectedColor(data.color_variants[0])
        }
        setLoading(false)
        
        document.dispatchEvent(new Event('prerender-trigger'))
      })
  }, [id])

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) {
      showToast('Sign in to add items to cart', 'info')
      navigate('/login')
      return
    }
    if (!product) return

    setAddingCart(true)
    // useCart.addItem writes to Supabase AND updates local store
    // so both this device and any other logged-in device syncs
    await addItem(product, selectedColor || null)
    setAddingCart(false)
  }

  // ── Order now — add to cart then go straight to checkout ──
  const handleOrderNow = async () => {
    if (!user) {
      showToast('Sign in to place an order', 'info')
      navigate('/login')
      return
    }
    if (!product) return

    setOrderingNow(true)
    await addItem(product, selectedColor || null)
    setOrderingNow(false)
    navigate('/checkout')
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="py-4 space-y-4 max-w-xl mx-auto">

        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />

        {/* Image gallery skeleton */}
        <div className="flex gap-3 items-center">
          <div className="w-20 aspect-square bg-gray-200 rounded-xl animate-pulse shrink-0" />
          <div className="flex-1 aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          <div className="w-20 aspect-square bg-gray-200 rounded-xl animate-pulse shrink-0" />
        </div>

        {/* Text skeletons */}
        <div className="space-y-3 pt-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5" />
        </div>

        {/* Color dots skeleton */}
        <div className="flex gap-3 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Button skeleton */}
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!product) return null

  const inStock = product.stock_count > 0

  return (
    <div className="py-4 max-w-xl mx-auto lg:max-w-2xl space-y-5">
       <SEO
          title={product.name}
          description={`Buy ${product.name} for KES ${product.price} at TiniTrove.`}       
          image={product?.image_urls?.[0]}
          path={`/product/${product?.id}`}
       />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-charcoal transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Back
      </button>

      {/* Page title + stock status */}
      <div className="flex items-start justify-between">
        <h2 className="font-display text-xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5">
          Product detail
        </h2>
        <div className={`
          flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
          ${inStock
            ? 'bg-green-50 text-green-600 border border-green-100'
            : 'bg-red-50 text-red-400 border border-red-100'}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
          {inStock ? `In stock (${product.stock_count})` : 'Out of stock'}
        </div>
      </div>

      {/* ── Image gallery ─────────────────────────────────── */}
      <div className="flex gap-2 items-center">

        {/* Left thumbnail — shows previous image */}
        {product.image_urls.length > 1 ? (
          <button
            onClick={() => setActiveImage(
              activeImage > 0 ? activeImage - 1 : product.image_urls.length - 1
            )}
            className="w-20 aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <img
              src={product.image_urls[
                activeImage > 0 ? activeImage - 1 : product.image_urls.length - 1
              ]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          // Placeholder left thumbnail when only one image
          <div className="w-20 aspect-square rounded-xl bg-gray-100 shrink-0" />
        )}

        {/* Main centre image */}
        <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md">
          {product.image_urls?.[activeImage] ? (
            <img
              src={product.image_urls[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Right thumbnail — shows next image */}
        {product.image_urls.length > 1 ? (
          <button
            onClick={() => setActiveImage(
              activeImage < product.image_urls.length - 1 ? activeImage + 1 : 0
            )}
            className="w-20 aspect-square rounded-xl overflow-hidden bg-gray-100 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <img
              src={product.image_urls[
                activeImage < product.image_urls.length - 1 ? activeImage + 1 : 0
              ]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </button>
        ) : (
          // Placeholder right thumbnail when only one image
          <div className="w-20 aspect-square rounded-xl bg-gray-100 shrink-0" />
        )}
      </div>

      {/* Dot indicators for multiple images */}
      {product.image_urls.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {product.image_urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`rounded-full transition-all duration-200 ${
                i === activeImage
                  ? 'w-4 h-1.5 bg-brand-pink'
                  : 'w-1.5 h-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Product info card ─────────────────────────────── */}
      <div className="space-y-4 bg-white rounded-2xl border border-pink-100 p-4 shadow-sm">

        {/* Name */}
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Product name:</p>
          <p className="text-base font-medium text-brand-charcoal">
            {product.name}
          </p>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Description:</p>
          <p className="text-sm text-brand-charcoal leading-relaxed">
            {product.description ?? 'No description available.'}
          </p>
        </div>

        {/* Color selector */}
        {product.color_variants?.length > 0 && (
          <div>
            <p className="text-xs text-brand-muted mb-2">Choose color:</p>
            <div className="flex flex-wrap gap-3">
              {product.color_variants.map(color => {
                const hex      = COLOR_HEX[color] ?? '#E5E7EB'
                const isSelected = selectedColor === color
                const isLight  = ['White', 'Warm White', 'Cool White', 'Yellow'].includes(color)

                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`
                      relative w-10 h-10 rounded-full transition-all duration-150
                      ${isSelected
                        ? 'ring-2 ring-offset-2 ring-brand-charcoal scale-110'
                        : 'hover:scale-105'}
                      ${isLight ? 'border border-gray-200' : ''}
                    `}
                    style={{ backgroundColor: hex }}
                  >
                    {/* Inner dot when selected — matches wireframe */}
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-full">
                        <span className={`
                          w-2.5 h-2.5 rounded-full
                          ${isLight ? 'bg-brand-charcoal' : 'bg-white'}
                        `} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedColor && (
              <p className="text-xs text-brand-muted mt-1.5">
                Selected:{' '}
                <span className="text-brand-charcoal font-medium">
                  {selectedColor}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Price */}
        <div>
          <p className="text-xs text-brand-muted mb-0.5">Price:</p>
          <p className="text-xl font-semibold text-brand-charcoal">
            KES {product.price.toLocaleString('en-KE')}
          </p>
        </div>
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex gap-3 pb-2">

        {/* Order now — outline style */}
        <button
          onClick={handleOrderNow}
          disabled={orderingNow || !inStock}
          className="
            flex-1 flex items-center justify-center gap-2
            py-3.5 rounded-xl text-sm font-medium
            border-2 border-brand-charcoal text-brand-charcoal
            hover:bg-brand-charcoal hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {orderingNow
            ? <Loader2 size={15} strokeWidth={2} className="animate-spin" />
            : <Zap size={15} strokeWidth={1.5} />
          }
          {orderingNow ? 'Processing…' : 'Order now'}
        </button>

        {/* Add to cart — filled style */}
        <button
          onClick={handleAddToCart}
          disabled={addingCart || !inStock}
          className="
            flex-1 flex items-center justify-center gap-2
            py-3.5 rounded-xl text-sm font-medium
            bg-brand-charcoal text-white
            hover:bg-brand-charcoal/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {addingCart
            ? <Loader2 size={15} strokeWidth={2} className="animate-spin" />
            : <ShoppingCart size={15} strokeWidth={1.5} />
          }
          {addingCart ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}