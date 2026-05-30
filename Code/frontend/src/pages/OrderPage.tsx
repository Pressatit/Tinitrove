import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, CreditCard, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'

// ── Types ─────────────────────────────────────────────────────
interface OrderItem {
  id:             string
  product_id:     string
  quantity:       number
  unit_price:     number
  color_selected: string | null
  products: {
    name:       string
    image_urls: string[]
  } | null
}

interface Order {
  id:               string
  status:           'cart' | 'in_transit' | 'to_be_shipped' | 'completed'
  total_amount:     number
  payment_status:   'pending' | 'paid' | 'failed'
  delivery_address: string
  created_at:       string
  order_items:      OrderItem[]
}

// ── Status color + label map ──────────────────────────────────
const STATUS_STYLES: Record<Order['status'], { label: string; color: string }> = {
  cart:          { label: 'Pending',      color: 'text-red-400'    },
  in_transit:    { label: 'In transit',   color: 'text-yellow-500' },
  to_be_shipped: { label: 'To be shipped', color: 'text-cyan-500'  },
  completed:     { label: 'Completed',    color: 'text-green-500'  },
}

// ── Format order ref — last 3 digits of UUID ─────────────────
function orderRef(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

// ── Format date ───────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })
}

// ── Single order card ─────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded,   setExpanded]   = useState(false)
  const [paying,     setPaying]     = useState(false)
  const showToast  = useToastStore(s => s.showToast)
  const navigate   = useNavigate()

  const { label, color } = STATUS_STYLES[order.status]

  // Total items across all order_items
  const totalQty = order.order_items.reduce((sum, i) => sum + i.quantity, 0)

  const handleCompletePayment = async () => {
    setPaying(true)
    // TODO: trigger M-Pesa STK push for this order
    // For now navigate to checkout with this order pre-loaded
    showToast('Redirecting to payment…', 'info')
    setTimeout(() => {
      setPaying(false)
      navigate('/checkout')
    }, 800)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden"
    >
      {/* ── Order header ──────────────────────────────────── */}
      <div className="p-5">
        {/* Top row — order ref, qty, amount, status, date */}
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 mb-6">

          <div className="text-center">
            <p className="text-xs text-brand-muted mb-0.5">Order ref</p>
            <p className="font-display text-l font-semibold text-brand-charcoal">
              {orderRef(order.id)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-brand-muted mb-0.5">Item quantity</p>
            <p className="font-display text-l font-semibold text-brand-charcoal">
              {totalQty}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-brand-muted mb-0.5">Total amount</p>
            <p className="font-display text-l font-semibold text-brand-charcoal">
              {order.total_amount.toLocaleString('en-KE')}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-brand-muted mb-0.5">Status</p>
            <p className={`font-display text-l font-semibold ${color}`}>
              {label}
            </p>
          </div>

          <div className="text-center col-span-4 lg:col-span-1">
            <p className="text-xs text-brand-muted mb-0.5">Created on</p>
            <p className="font-display text-base font-semibold text-brand-charcoal">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Items section header — always visible */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-brand-charcoal text-sm">Items</h3>
          {expanded
            ? <ChevronUp size={16} strokeWidth={1.5} className="text-brand-muted" />
            : <ChevronDown size={16} strokeWidth={1.5} className="text-brand-muted" />
          }
        </button>
      </div>

      {/* ── Expandable items list ─────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3 space-y-3 border-t border-pink-50 pt-3">
              {order.order_items.map((item, index) => {
                const lineTotal = item.unit_price * item.quantity
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    {/* Row number */}
                    <span className="text-xs text-brand-muted w-4 shrink-0">
                      {index + 1}
                    </span>

                    {/* Product image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.products?.image_urls?.[0] ? (
                        <img
                          src={item.products.image_urls[0]}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Item details — matches wireframe table layout */}
                    <div className="flex-1 grid grid-cols-5 gap-1 text-xs">
                      <div>
                        <p className="text-brand-muted mb-0.5">Item name</p>
                        <p className="font-medium text-brand-charcoal truncate">
                          {item.products?.name ?? 'Unknown'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand-muted mb-0.5">Quantity</p>
                        <p className="font-medium text-brand-charcoal">{item.quantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand-muted mb-0.5">Color</p>
                        <p className="font-medium text-brand-charcoal">
                          {item.color_selected ?? '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand-muted mb-0.5">unitPrice</p>
                        <p className="font-medium text-brand-charcoal">
                          {item.unit_price.toLocaleString('en-KE')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand-muted mb-0.5">total</p>
                        <p className="font-medium text-brand-charcoal">
                          {lineTotal.toLocaleString('en-KE')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Complete payment button — only on pending orders */}
            {order.payment_status === 'pending' && (
              <div className="px-5 pb-5 flex justify-end">
                <button
                  onClick={handleCompletePayment}
                  disabled={paying}
                  className="
                    flex items-center gap-2 px-5 py-2.5
                    rounded-xl text-sm font-medium
                    bg-brand-charcoal text-white
                    hover:bg-brand-charcoal/90
                    disabled:opacity-60
                    transition-colors
                  "
                >
                  {paying
                    ? <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                    : <CreditCard size={14} strokeWidth={1.5} />
                  }
                  {paying ? 'Redirecting…' : 'Complete payment'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Orders page ───────────────────────────────────────────────
export default function OrdersPage() {
  const navigate  = useNavigate()
  const profile   = useAuthStore(s => s.profile)
  const showToast = useToastStore(s => s.showToast)

  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    const fetchOrders = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          payment_status,
          delivery_address,
          created_at,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            color_selected,
            products (
              name,
              image_urls
            )
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        showToast('Failed to load orders', 'error')
        setLoading(false)
        return
      }

      setOrders(data as unknown as Order[])
      setLoading(false)
    }

    fetchOrders()

    // Realtime — order status updates reflect immediately
    const channel = supabase
      .channel('orders-page')
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
          filter: `user_id=eq.${profile.id}`,
        },
        () => fetchOrders()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="py-4 space-y-4 max-w-2xl mx-auto lg:max-w-4xl">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-pink-100 p-5 space-y-3">
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
              {[1,2,3,4,5].map(j => (
                <div key={j} className="space-y-1 text-center">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                  <div className="h-7 bg-gray-200 rounded animate-pulse mx-auto w-12" />
                </div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        ))}
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-4 min-h-[50vh]">
        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
          <Package size={28} strokeWidth={1} className="text-brand-pink" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-display text-xl text-brand-charcoal">No orders yet</h3>
          <p className="text-sm text-brand-muted">Your orders will appear here after checkout</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 transition-colors"
        >
          Start shopping
        </button>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4 max-w-2xl mx-auto lg:max-w-4xl">

      {/* Page header */}
      <h2 className="font-display text-2xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5 inline-block">
        Orders
      </h2>

      {/* Order cards — numbered as per wireframe */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={order.id} className="flex items-start">
            {/* Order number — large on left matching wireframe */}
            <span className="font-display text-xl font-bold text-brand-charcoal w-8 shrink-0 mt-4">
              {index + 1}
            </span>
            <div className="flex-1">
              <OrderCard order={order} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}