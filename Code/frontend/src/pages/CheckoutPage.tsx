import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import NumberFlow from '@number-flow/react'
import {
  ShoppingCart, X, Minus, Plus, MapPin,Copy, Loader2, ChevronLeft,
  Package, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCartStore, selectCartItemCount, selectCartTotalPrice, type CartItemWithProduct } from '@/stores/cartstore'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'
import { supabase } from '@/lib/supabaseClient'
import { useDeliveryFee } from '@/hooks/useDeliveryfee'


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
  const [orderId,       setOrderId]       = useState<string >('')

  // Delivery form — pre-filled from profile
  const [fullName,  setFullName]  = useState(
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  )
  const [phone,     setPhone]     = useState(profile?.phone ?? '')
  const [county,    setCounty]    = useState(profile?.delivery_address ?? '')

  

  // Payment
  //const [mpesaPhone, setMpesaPhone] = useState(profile?.phone ?? '')
  //const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'pending_verification'>('pending')
  const [mpesaCode, setMpesaCode] = useState('')
  const [copied,    setCopied]    = useState(false)

  

  const { fee: deliveryFee, area:area, isServiceable, error: zoneError, loading: zoneLoading } =
  useDeliveryFee(county)
  
  const orderTotal = totalPrice + (deliveryFee ?? 0)



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

  const handleSubmitMpesaCode = async (mpesaCode: string) => {
    if (mpesaCode.length < 8) {
      showToast('Please enter a valid M-Pesa code', 'error')
      return
    }

    setSubmitting(true)

    // Update the existing order we created in handlePlaceOrder
    const { error } = await supabase
      .from('orders')
      .update({ 
        mpesa_ref: mpesaCode.trim().toUpperCase(),
        payment_status: 'pending_verification' // Flags it for you to check in the admin panel
      })
      .eq('id', orderId)

    if (error) {
      showToast('Failed to save M-Pesa code. Please try again.', 'error')
      setSubmitting(false)
      return
    }

    // Now that payment is logged, clear the cart and show the success screen
    await clearCart()
    setStep('confirmed')
    setSubmitting(false)
  }

const handleCopyTill = () => {
    navigator.clipboard.writeText('1214248')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Create order in Supabase ──────────────────────────────
  const handlePlaceOrder = async () => {
    if (!profile?.id) {
      showToast('Please sign in to continue', 'error')
      navigate('/login')
      return
    }

    setSubmitting(true)

    const deliveryAddress = `${fullName}, ${county}`

    // Step 1: insert the order row
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          profile.id,
        status:           'cart',
        total_amount:     orderTotal,
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
    
    setOrderId(orderId)
    setStep('payment') // Change your UI state to show the M-Pesa instructions
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
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
      >
        <CheckCircle size={40} strokeWidth={1.5} className="text-green-500" />
      </motion.div>

      <div className="space-y-1">
        <h2 className="font-display text-2xl text-brand-charcoal">Order received! </h2>
        <p className="text-sm text-brand-muted">
          We've received your order and M-Pesa reference.
        </p>
        {orderId && (
          <p className="text-xs text-brand-muted mt-2 font-mono">
            Order ref: {orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-left w-full">
        <p className="text-xs font-semibold text-yellow-700 mb-2">What happens next:</p>
        <ol className="space-y-1.5 text-xs text-yellow-800">
          <li>1. We verify your M-Pesa payment (within 1 hour)</li>
          <li>2. Your order status updates to confirmed</li>
          <li>3. We dispatch your items and notify you</li>
          <li>4. Track your order in the Orders tab</li>
        </ol>
      </div>

      <p className="text-xs text-brand-muted">
        Questions? WhatsApp us at{' '}
        <a
          href="https://wa.me/254111970400"
          className="text-brand-pink hover:underline"
        >
          0111970400
        </a>
      </p>

      <div className="flex gap-3 w-full">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/orders')}>
          View orders
        </Button>
        <Button className="flex-1" onClick={() => navigate('/')}>
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


            {county && !zoneLoading && (
                 <div className={`
                   flex items-center justify-between px-3 py-2 rounded-xl text-xs
                   ${isServiceable
                     ? deliveryFee === 0
                       ? 'bg-green-50 text-green-600 border border-green-100'
                       : 'bg-pink-50/60 text-brand-charcoal border border-pink-100'
                     : 'bg-red-50 text-red-400 border border-red-100'}
                 `}>
                   {isServiceable ? (
                     <>
                       <span>Delivery to {county}{county === 'Kirinyaga' ? ' (Sagana)' : ''}</span>
                       <span className="font-semibold">
                         {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}
                       </span>
                     </>
                   ) : (
                     <span>{zoneError}</span>
                   )}
                 </div>)}
                </div>

                {/* Street address */}
               <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted">Town / Area</label>
                  <div className={cn(
                    inputClass, 
                    "bg-gray-50/80 text-brand-charcoal select-none flex items-center font-medium",
                    !county && "text-brand-muted font-normal italic"
                  )}>
                    {county ? (
                      area || (zoneLoading ? "Fetching area..." : "Not specified")
                    ) : (
                      "Select a county to determine town"
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-2"
                  disabled={!fullName || !phone || !county || !isServiceable || submitting}
                  onClick={handlePlaceOrder} 
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating Order...
                    </div>
                  ) : (
                    'Place Order & Pay'
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2: Payment ──────────────────────────── */}
            {step === 'payment' && (
        <div className="bg-white p-6 rounded-2xl border border-pink-100 max-w-md mx-auto mt-8">
          <h2 className="font-display text-xl text-brand-charcoal mb-4">Pay via M-Pesa</h2>
          
          <div className="bg-brand-cream p-4 rounded-xl space-y-3 text-sm text-brand-charcoal mb-6">
            <p>1. Go to M-Pesa on your phone</p>
            <p>2. Select <strong>Lipa na M-Pesa &gt; Buy Goods and Services</strong></p>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-pink-100">
              <p>3. Enter Till: <strong className="text-brand-pink text-lg tracking-widest">1685033</strong></p>
              <button onClick={handleCopyTill} type="button" className="text-brand-muted hover:text-brand-pink transition-colors">
                {copied ? <CheckCircle size={18} className="text-green-500"/> : <Copy size={18} />}
              </button>
            </div>
            {/* Using orderTotal from your existing state */}
            <p>4. Enter Amount: <strong>KES {orderTotal}</strong></p>
            <p>5. Enter your M-Pesa PIN</p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitMpesaCode(mpesaCode)
            }} 
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-medium text-brand-muted mb-1 block">
                M-Pesa Transaction Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TK12ABCDE"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-100 uppercase focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              // Using submitting from your existing state
              disabled={submitting || mpesaCode.length < 8}
              className="w-full py-3.5 bg-brand-charcoal text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-charcoal/90 disabled:opacity-50 transition-colors"
            >
              {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
              {submitting ? 'Verifying...' : 'Confirm Payment'}
            </button>
          </form>
        </div>
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
                KES <NumberFlow value={orderTotal} />
              </span>
            </div>
            <p className="text-[11px] text-brand-muted mt-1">
              Delivery charges added
            </p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}