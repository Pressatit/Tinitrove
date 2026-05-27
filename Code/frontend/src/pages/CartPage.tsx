import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useCartStore, selectCartItemCount, selectCartTotalPrice, type CartItemWithProduct } from '@/stores/cartstore'
import { useCart } from '@/hooks/useCart'
import { useToastStore } from '@/stores/toaststore'
import ProductCard from '@/components/ui/productcard'
import ProductCardSkeleton from '@/components/ui/productcardskeleton'
import { useProducts } from '@/hooks/useProduct'

function CartItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItemWithProduct
  onUpdateQty: (productId: string, qty: number) => void
  onRemove: (productId: string, productName: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="
        flex items-center gap-3 p-3
        bg-white rounded-2xl
        border border-pink-100
        shadow-sm
      "
    >
      <div
        className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
        onClick={() => window.location.href = `/product/${item.product_id}`}
      >
        {item.product.image_urls?.[0] ? (
          <img
            src={item.product.image_urls[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-300 text-xs">photo</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-charcoal leading-tight truncate">
          {item.product.name}
        </p>
        <p className="text-sm text-brand-charcoal mt-0.5">
          KES {item.product.price.toLocaleString('en-KE')}
        </p>
        {item.color_selected && (
          <p className="text-xs text-brand-charcoal mt-0.5">
            {item.color_selected}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-xs text-brand-muted">Quantity</p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
            className="
              w-7 h-7 rounded-full flex items-center justify-center
              border border-pink-100 text-brand-charcoal
              hover:bg-pink-50 transition-colors text-sm font-medium
            "
            aria-label="Decrease quantity"
          >
            <Minus size={12} strokeWidth={2} />
          </button>

          <span className="
            w-8 h-7 rounded-lg bg-gray-100
            flex items-center justify-center
            text-sm font-semibold text-brand-charcoal
          ">
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock_count}
            className="
              w-7 h-7 rounded-full flex items-center justify-center
              border border-pink-100 text-brand-charcoal
              hover:bg-pink-50 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            aria-label="Increase quantity"
          >
            <Plus size={12} strokeWidth={2} />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.product_id, item.product.name)}
          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={11} strokeWidth={1.5} />
          Remove item
        </button>
      </div>
    </motion.div>
  )
}

function Suggestions() {
  const { products, loading } = useProducts({ limit: 4 })

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5 mb-4 inline-block">
        Suggestions
      </h3>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function CartPage() {
  const navigate   = useNavigate()
  const items      = useCartStore(s => s.items)
  const totalItems = useCartStore(selectCartItemCount)
  const totalPrice = useCartStore(selectCartTotalPrice)
  const { updateQty, removeItem, clearCart } = useCart()
  const showToast  = useToastStore(s => s.showToast)

  const [clearing, setClearing] = useState(false)

  const handleRemove = (productId: string, productName: string) => {
    void removeItem(productId, productName)
  }

  const handleClearCart = async () => {
    setClearing(true)
    await clearCart()
    showToast('Cart cleared', 'info')
    setClearing(false)
  }

  if (items.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center">
          <ShoppingBag size={36} strokeWidth={1} className="text-brand-pink" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-display text-xl text-brand-charcoal">Your cart is empty</h3>
          <p className="text-sm text-brand-muted">Add something cute to get started</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
            bg-brand-charcoal text-white hover:bg-brand-charcoal/90
            transition-colors
          "
        >
          Browse products
          <ChevronRight size={15} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  return (
    <div className="py-4 max-w-xl mx-auto lg:max-w-2xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5">
            Cart
          </h2>
          <p className="text-sm text-brand-muted mt-1.5">
            Items in cart: <span className="font-medium text-brand-charcoal">{totalItems}</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-brand-muted">Total Cart price:</p>
          <p className="text-lg font-semibold text-brand-charcoal">
            KES {totalPrice.toLocaleString('en-KE')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <CartItem
              key={item.product_id}
              item={item}
              onUpdateQty={(id, qty) => { void updateQty(id, qty) }}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => { void handleClearCart() }}
          disabled={clearing}
          className="text-xs text-red-400 hover:text-red-500 transition-colors"
        >
          {clearing ? 'Clearing…' : 'Clear cart'}
        </button>

        <button
          onClick={() => navigate('/checkout')}
          className="
            flex items-center gap-2
            px-8 py-3 rounded-xl text-sm font-medium
            bg-brand-charcoal text-white
            hover:bg-brand-charcoal/90
            transition-colors shadow-md
          "
        >
          Check out
          <ChevronRight size={15} strokeWidth={1.5} />
        </button>
      </div>

      <Suggestions />
    </div>
  )
}
