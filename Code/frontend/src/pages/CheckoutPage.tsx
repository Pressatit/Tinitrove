import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import NumberFlow from '@number-flow/react'
import {
  ShoppingCart, X, Minus, Plus, MapPin,
  Phone, CreditCard, Loader2, ChevronLeft,
  Package, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCartStore, selectCartItemCount, selectCartTotalPrice, type CartItemWithProduct } from '@/stores/cartstore'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'
import { supabase } from '@/lib/supabaseClient'

// ── Kenya counties ────────────────────────────────────────────
const COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

// ── Steps ─────────────────────────────────────────────────────
type Step = 'delivery' | 'payment' | 'confirmed'

// ── Animated cart item — from kokonutd component ──────────────
function CheckoutCartItem({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItemWithProduct
  onRemove: (id: string) => void
  onUpdateQty: (id: string, qty: number) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ opacity: { duration: 0.2 }, layout: { duration: 0.2 } }}
      className="flex items-center gap-3 p-2 rounded-xl bg-pink-50/50 mb-3"
    >
      {/* Product image */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {item.product.image_urls?.[0] ? (
          <img
            src={item.product.image_urls[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={14} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + remove */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-brand-charcoal truncate">
            {item.product.name}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemove(item.product_id)}
            className="p-1 rounded-md hover:bg-pink-100 ml-1 shrink-0"
          >
            <X className="w-3 h-3 text-brand-muted" />
          </motion.button>
        </div>

        {/* Qty controls + line total */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
              className="p-1 rounded-md hover:bg-pink-100"
            >
              <Minus className="w-3 h-3 text-brand-charcoal" />
            </motion.button>
            <motion.span
              layout
              className="text-xs text-brand-charcoal w-4 text-center font-medium"
            >
              {item.quantity}
            </motion.span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
              className="p-1 rounded-md hover:bg-pink-100"
            >
              <Plus className="w-3 h-3 text-brand-charcoal" />
            </motion.button>
          </div>
          <motion.span layout className="text-xs text-brand-muted">
            KES {(item.product.price * item.quantity).toLocaleString('en-KE')}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Shared input style ────────────────────────────────────────
const inputClass = `
  w-full px-3 py-3 text-sm rounded-xl outline-none
  bg-pink-50/50 border border-pink-100
  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
  text-brand-charcoal placeholder:text-brand-muted/60
  transition-all duration-150
`

export default function CheckoutPage() {
  const navigate    = useNavigate()
  const profile     = useAuthStore(s => s.profile)
  const items       = useCartStore(s => s.items)
  const totalItems  = useCartStore(selectCartItemCount)
  const totalPrice  = useCartStore(selectCartTotalPrice)
  const { removeItem, updateQty, clearCart } = useCart()
  const showToast   = useToastStore(s => s.showToast)

  const [step,          setStep]          = useState<Step>('delivery')
  const [submitting,    setSubmitting]    = useState(false)
  const [orderId,       setOrderId]       = useState<string | null>(null)

  // Delivery form — pre-filled from profile
  const [fullName,  setFullName]  = useState(
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  )
  const [phone,     setPhone]     = useState(profile?.phone ?? '')
  const [county,    setCounty]    = useState(profile?.delivery_address ?? '')
  const [address,   setAddress]   = useState('')
  

  // Payment
  const [mpesaPhone, setMpesaPhone] = useState(profile?.phone ?? '')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending')


// Subscribe to real-time changes on the orders table for this order
  useEffect(() => {
  if (!orderId || step !== 'confirmed') return

  
  const channel = supabase
    .channel(`order-status-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        const updatedOrder = payload.new
        if (updatedOrder.payment_status === 'paid') {
          setPaymentStatus('paid')
          showToast('Payment received successfully!', 'success')
        } else if (updatedOrder.payment_status === 'failed') {
          setPaymentStatus('failed')
          showToast('M-Pesa payment failed or was cancelled.', 'error')
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [orderId, step])

  // ── If cart is empty redirect ─────────────────────────────
  if (items.length === 0 && step !== 'confirmed') {
    return (
      <div className="py-12 flex flex-col items-center gap-4">
        <Package size={40} strokeWidth={1} className="text-brand-pink" />
        <p className="text-brand-muted text-sm">Your cart is empty</p>
        <Button onClick={() => navigate('/')}>Browse products</Button>
      </div>
    )
  }

  const triggerMpesaPayment = async (orderId: string, phone: string, amount: number) => {
  const { data, error } = await supabase.functions.invoke('mpesaSTKPush', {
    body: { orderId, phone, amount }
  })

  if (error || data.ResponseCode !== "0") {
    showToast("Failed to send M-Pesa prompt", "error")
    return
  }

  showToast("Check your phone to enter M-Pesa PIN!", "success")
}

  // ── Create order in Supabase ──────────────────────────────
  const handlePlaceOrder = async () => {
    if (!profile?.id) {
      showToast('Please sign in to continue', 'error')
      navigate('/login')
      return
    }

    setSubmitting(true)

    const deliveryAddress = `${fullName}, ${address}, ${county}`

    // Step 1: insert the order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          profile.id,
        status:           'cart',
        total_amount:     totalPrice,
        delivery_address: deliveryAddress,
        payment_status:   'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      showToast('Failed to create order, please try again', 'error')
      setSubmitting(false)
      return
    }

    // Step 2: insert all order_items as a batch
    const orderItems = items.map(item => ({
      order_id:       order.id,
      product_id:     item.product_id,
      quantity:       item.quantity,
      unit_price:     item.product.price,
      color_selected: item.color_selected,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      showToast('Order created but items failed — contact support', 'error')
      setSubmitting(false)
      return
    }

    // Step 3: trigger M-Pesa STK push
    const orderId=order.id
    
    triggerMpesaPayment(orderId,mpesaPhone,totalPrice)
    
    

    // Step 4: clear cart (DB + store) and show confirmation
    setOrderId(order.id)
    await clearCart()
    setStep('confirmed')
    setSubmitting(false)
  }

  // ── Confirmed screen ──────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-12 flex flex-col items-center gap-5 text-center max-w-sm mx-auto"
      >
        <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center",
          paymentStatus === 'paid' && "bg-green-50",
          paymentStatus === 'pending' && "bg-amber-50",
          paymentStatus === 'failed' && "bg-red-50"
        )}
      >
        {paymentStatus === 'paid' && <CheckCircle size={40} className="text-green-500" />}
        {paymentStatus === 'pending' && <Loader2 size={40} className="text-amber-500 animate-spin" />}
        {paymentStatus === 'failed' && <X size={40} className="text-red-500" />}
      </motion.div>

        <div className="space-y-1">
        <h2 className="font-display text-2xl text-brand-charcoal">
          {paymentStatus === 'paid' && "Payment Confirmed!"}
          {paymentStatus === 'pending' && "Waiting for M-Pesa Confirmation…"}
          {paymentStatus === 'failed' && "Payment Failed"}
        </h2>
        
        {orderId && (
          <p className="text-xs text-brand-muted mt-2">
            Order ref: <span className="font-mono text-brand-charcoal">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
      </div>

      <p className="text-xs text-brand-muted px-4 leading-relaxed">
        {paymentStatus === 'paid' && "Your payment has been received and your order is being processed!"}
        {paymentStatus === 'pending' && "Check your phone and enter your M-Pesa PIN to complete the transaction."}
        {paymentStatus === 'failed' && "The transaction was cancelled or failed. You can try again from your orders page."}
      </p>

        <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/orders')}
        >
          View orders
        </Button>
        <Button
          className="flex-1"
          onClick={() => navigate('/')}
        >
          Keep shopping
        </Button>
      </div>
    </motion.div>
  )
}

  return (
    // Responsive: stacked on mobile, side-by-side on desktop
    // mirrors kokonutd's flex gap-6 layout
    <div className="py-4 w-full max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: form steps ──────────────────────────────── */}
        <div className="flex-1 space-y-4">

          {/* Back button */}
          <button
            onClick={() => step === 'delivery' ? navigate('/cart') : setStep('delivery')}
            className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-charcoal transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            {step === 'delivery' ? 'Back to cart' : 'Back to delivery'}
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(['delivery', 'payment'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  step === s || (step === 'payment' && s === 'delivery')
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-gray-100 text-brand-muted'
                )}>
                  {step === 'payment' && s === 'delivery'
                    ? '✓'
                    : i + 1}
                </div>
                <span className={cn(
                  'text-xs capitalize',
                  step === s ? 'text-brand-charcoal font-medium' : 'text-brand-muted'
                )}>
                  {s}
                </span>
                {i === 0 && (
                  <div className={cn(
                    'w-8 h-0.5 mx-1 transition-colors',
                    step === 'payment' ? 'bg-brand-charcoal' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Delivery ───────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-pink-100 p-5 space-y-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} strokeWidth={1.5} className="text-brand-pink" />
                  <h3 className="text-sm font-medium text-brand-charcoal">
                    Delivery details
                  </h3>
                </div>

                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">Full name</label>
                  <input
                    className={inputClass}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">Phone number</label>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    type="tel"
                  />
                </div>

                {/* County */}
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">County</label>
                  <div className="relative">
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={county}
                      onChange={e => setCounty(e.target.value)}
                    >
                      <option value="" disabled>Select your county</option>
                      {COUNTIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted text-xs">▾</span>
                  </div>
                </div>

                {/* Street address */}
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">Street / estate / building</label>
                  <input
                    className={inputClass}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Kilimani, Lavington Road, Apt 4B"
                  />
                </div>

                <Button
                  className="w-full mt-2"
                  disabled={!fullName || !phone || !county || !address}
                  onClick={() => setStep('payment')}
                >
                  Continue to payment
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2: Payment ──────────────────────────── */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-pink-100 p-5 space-y-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} strokeWidth={1.5} className="text-brand-pink" />
                  <h3 className="text-sm font-medium text-brand-charcoal">
                    Pay via M-Pesa
                  </h3>
                </div>

                {/* M-Pesa explainer */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 leading-relaxed">
                  Enter the phone number registered with M-Pesa. You'll receive a payment prompt — enter your PIN to complete the order.
                </div>

                {/* M-Pesa phone */}
                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">M-Pesa phone number</label>
                  <input
                    className={inputClass}
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    placeholder="0712 345 678"
                    type="tel"
                  />
                  <p className="text-[11px] text-brand-muted">
                    Safaricom numbers only (07xx or 01xx)
                  </p>
                </div>

                {/* Delivery summary */}
                <div className="bg-pink-50/50 rounded-xl p-3 text-xs text-brand-muted space-y-1">
                  <p className="font-medium text-brand-charcoal text-xs mb-1">Delivering to:</p>
                  <p>{fullName}</p>
                  <p>{address}, {county}</p>
                  <p>{phone}</p>
                </div>

                {/* Amount to pay */}
                <div className="flex items-center justify-between py-2 border-t border-pink-100">
                  <span className="text-sm font-medium text-brand-charcoal">Total to pay</span>
                  <span className="text-lg font-semibold text-brand-charcoal">
                    KES {totalPrice.toLocaleString('en-KE')}
                  </span>
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={submitting || !mpesaPhone}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                      Sending prompt…
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} strokeWidth={1.5} />
                      Pay KES {totalPrice.toLocaleString('en-KE')}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: order summary panel ─────────────────────── */}
        {/* kokonutd's sticky cart panel — adapted to TiniTrove data */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'lg:w-80 flex flex-col',
            'p-4 rounded-2xl',
            'bg-white border border-pink-100',
            'lg:sticky lg:top-4',
            'lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden'
          )}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-brand-muted" />
            <h2 className="text-sm font-medium text-brand-charcoal">
              Order summary ({totalItems})
            </h2>
          </div>

          {/* Scrollable items list */}
          <div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map(item => (
                <CheckoutCartItem
                  key={item.product_id}
                  item={item}
                  onRemove={(id) => { void removeItem(id) }}
                  onUpdateQty={(id, qty) => { void updateQty(id, qty) }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Total — NumberFlow animates when quantities change */}
          <motion.div
            layout
            className="pt-3 mt-3 border-t border-pink-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-charcoal">Total</span>
              <span className="text-sm font-semibold text-brand-charcoal">
                KES <NumberFlow value={totalPrice} />
              </span>
            </div>
            <p className="text-[11px] text-brand-muted mt-1">
              Delivery charges calculated at dispatch
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}