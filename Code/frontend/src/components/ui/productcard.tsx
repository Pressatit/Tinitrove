import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authstore'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { 
      navigate('/login')
      return
    }
    setAdding(true)
    await addItem(product, product.color_variants?.[0] ?? null)
    setAdding(false)
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="
        bg-white rounded-2xl overflow-hidden
        shadow-md hover:shadow-xl
        transition-shadow duration-300
        cursor-pointer flex flex-col
      "
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-sm">photo</span>
          </div>
        )}
        {product.stock_count <= 3 && product.stock_count > 0 && (
          <span className="absolute top-2 left-2 bg-red-50 text-red-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-red-100">
            Only {product.stock_count} left
          </span>
        )}
        {product.stock_count === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">Out of stock</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-charcoal leading-tight line-clamp-2">
            {product.name}
          </p>
          <p className="text-sm text-brand-muted mt-0.5">
            KES {product.price.toLocaleString('en-KE')}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock_count === 0}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              bg-brand-charcoal text-white hover:bg-brand-charcoal/90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {adding
              ? <Loader2 size={12} strokeWidth={2} className="animate-spin" />
              : <ShoppingCart size={12} strokeWidth={2} />
            }
            {adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}