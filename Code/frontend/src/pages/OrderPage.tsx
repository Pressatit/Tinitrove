import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, CreditCard, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'

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

const STATUS_STYLES: Record<Order['status'], { label: string; color: string }> = {
  cart:          { label: 'Pending',       color: 'text-red-400'    },
  in_transit:    { label: 'In transit',    color: 'text-yellow-500' },
  to_be_shipped: { label: 'To be shipped', color: 'text-cyan-500'   },
  completed:     { label: 'Completed',     color: 'text-green-500'  },
}

function orderRef(id: string): string {
  return id.replace(/-/g, '').slice(-8).toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const [paying,   setPaying]   = useState(false)
  
  const showToast = useToastStore(s => s.showToast)
  
  const profile =useAuthStore((s)=>s.profile)

  const { label, color } = STATUS_STYLES[order.status]
  const totalQty = order.order_items.reduce((sum, i) => sum + i.quantity, 0)

  const handleCompletePayment = async (order: Order) => {
  
  setPaying(true)
  
  showToast('Initiating M-Pesa payment…', 'info')

  try {
    // Call the mpesaSTKPush Edge Function with the existing order details
    const { data, error } = await supabase.functions.invoke('mpesaSTKPush', {
      body: { 
        orderId: order.id, 
        phone: profile?.phone, // Use order phone or user's default phone
        amount: order.total_amount 
      }
    })

    if (error || data?.ResponseCode !== "0") {
      showToast('Failed to send M-Pesa prompt. Please try again.', 'error')
      setPaying(false)
      
      return
    }

    showToast('Check your phone to enter M-Pesa PIN!', 'success')
  } catch (err) {
    showToast('Something went wrong initiating payment.', 'error')
  } finally {
    setPaying(false)
    
  }
}

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 lg:p-5">

        {/* ── Order header ──────────────────────────────────────────
            MOBILE:  2×2 grid + date below + status spanning full width
            DESKTOP: single 5-column row (original layout)
        ──────────────────────────────────────────────────────────── */}

        {/* Desktop header — hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Order ref',     value: orderRef(order.id),                        bold: true  },
            { label: 'Item quantity', value: String(totalQty),                           bold: true  },
            { label: 'Total amount',  value: order.total_amount.toLocaleString('en-KE'), bold: true  },
            { label: 'Status',        value: label,                                      status: true },
            { label: 'Created on',    value: formatDate(order.created_at),               bold: false },
          ].map(({ label: l, value, status }) => (
            <div key={l} className="text-center">
              <p className="text-xs text-brand-muted mb-0.5">{l}</p>
              <p className={`font-display text-xl font-semibold ${status ? color : 'text-brand-charcoal'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile header — hidden on desktop */}
        <div className="lg:hidden mb-3 space-y-2">
          {/* Row 1: ref + status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-muted">Order ref</p>
              <p className="font-mono text-sm font-bold text-brand-charcoal">
                {orderRef(order.id)}
              </p>
            </div>
            <div className={`
              text-xs font-semibold px-3 py-1 rounded-full
              ${order.status === 'completed'     ? 'bg-green-50  text-green-500'  : ''}
              ${order.status === 'in_transit'    ? 'bg-yellow-50 text-yellow-600' : ''}
              ${order.status === 'to_be_shipped' ? 'bg-cyan-50   text-cyan-600'   : ''}
              ${order.status === 'cart'          ? 'bg-red-50    text-red-400'    : ''}
            `}>
              {label}
            </div>
          </div>

          {/* Row 2: qty + amount + date in a tight strip */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-1 bg-pink-50/60 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-brand-muted">Items</p>
              <p className="font-semibold text-brand-charcoal">{totalQty}</p>
            </div>
            <div className="flex-1 bg-pink-50/60 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-brand-muted">Total (KES)</p>
              <p className="font-semibold text-brand-charcoal">
                {order.total_amount.toLocaleString('en-KE')}
              </p>
            </div>
            <div className="flex-1 bg-pink-50/60 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-brand-muted">Date</p>
              <p className="font-semibold text-brand-charcoal text-xs">
                {new Date(order.created_at).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Items toggle — shared between mobile and desktop */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-between w-full text-left pt-2 border-t border-pink-50"
        >
          <h3 className="font-semibold text-brand-charcoal text-sm">Items</h3>
          {expanded
            ? <ChevronUp   size={16} strokeWidth={1.5} className="text-brand-muted" />
            : <ChevronDown size={16} strokeWidth={1.5} className="text-brand-muted" />
          }
        </button>
      </div>

      {/* ── Expandable items ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 lg:px-5 pb-3 space-y-3 border-t border-pink-50 pt-3">
              {order.order_items.map((item, index) => {
                const lineTotal = item.unit_price * item.quantity
                return (
                  <div key={item.id} className="flex items-start gap-3">

                    {/* Row number */}
                    <span className="text-xs text-brand-muted w-4 shrink-0 mt-1">
                      {index + 1}
                    </span>

                    {/* Product image */}
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.products?.image_urls?.[0] ? (
                        <img
                          src={item.products.image_urls[0]}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Item details
                        MOBILE:  stacked card — name on top, then 2×2 grid of stats
                        DESKTOP: single 5-column row (original)
                    */}
                    <div className="flex-1 min-w-0">

                      {/* Product name — shared */}
                      <p className="text-xs font-medium text-brand-charcoal truncate mb-1.5">
                        {item.products?.name ?? 'Unknown product'}
                      </p>

                      {/* Desktop stats row — hidden on mobile */}
                      <div className="hidden lg:grid lg:grid-cols-4 gap-2 text-xs">
                        {[
                          { label: 'Quantity',   value: String(item.quantity)                       },
                          { label: 'Color',      value: item.color_selected ?? '—'                  },
                          { label: 'Unit price', value: `KES ${item.unit_price.toLocaleString()}`   },
                          { label: 'Total',      value: `KES ${lineTotal.toLocaleString()}`         },
                        ].map(({ label: l, value }) => (
                          <div key={l}>
                            <p className="text-brand-muted mb-0.5">{l}</p>
                            <p className="font-medium text-brand-charcoal">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Mobile stats — 2×2 pill grid */}
                      <div className="lg:hidden grid grid-cols-2 gap-1.5 text-xs">
                        {[
                          { label: 'Qty',   value: String(item.quantity)                     },
                          { label: 'Color', value: item.color_selected ?? '—'                },
                          { label: 'Price', value: `KES ${item.unit_price.toLocaleString()}` },
                          { label: 'Total', value: `KES ${lineTotal.toLocaleString()}`       },
                        ].map(({ label: l, value }) => (
                          <div
                            key={l}
                            className="bg-gray-50 rounded-lg px-2.5 py-1.5 flex items-center justify-between"
                          >
                            <span className="text-brand-muted">{l}</span>
                            <span className="font-medium text-brand-charcoal">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Complete payment button — pending orders only */}
            {order.payment_status === 'pending' || order.payment_status === 'failed' && (
              <div className="px-4 lg:px-5 pb-4 flex justify-end">
                <button
                  onClick={()=>handleCompletePayment(order)}
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
                  {paying ? 'Sending prompt ...' : 'Complete payment'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

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
          id, status, total_amount, payment_status,
          delivery_address, created_at,
          order_items (
            id, product_id, quantity, unit_price, color_selected,
            products ( name, image_urls )
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) { showToast('Failed to load orders', 'error'); setLoading(false); return }
      setOrders(data as unknown as Order[])
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('orders-page')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${profile.id}`,
      }, () => fetchOrders())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  if (loading) {
    return (
      <div className="py-4 space-y-4 max-w-2xl mx-auto lg:max-w-4xl">
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-pink-100 p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(j => (
                <div key={j} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

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
      <h2 className="font-display text-2xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5 inline-block">
        Orders
      </h2>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={order.id} className="flex gap-3 items-start">
            <span className="font-display text-2xl lg:text-3xl font-bold text-brand-charcoal w-6 lg:w-8 shrink-0 mt-4">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <OrderCard order={order} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}