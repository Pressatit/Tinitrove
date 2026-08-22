import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Edit3, Save, X,
  ShoppingCart, Truck, Package, CheckCircle, CircleDashed,Star,
  Info, Heart
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'
import { useCartStore, selectCartItemCount } from '@/stores/cartstore'
import { useToastStore } from '@/stores/toaststore'

// ── Kenya counties for the edit dropdown ─────────────────────
const COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

// ── Order status indicator config ────────────────────────────
const ORDER_STATUSES = [
  { key: 'cart',          label: 'Cart',             color: 'bg-gray-400',   Icon: ShoppingCart },
  { key: 'in_transit',    label: 'In transit',       color: 'bg-yellow-400', Icon: Truck        },
  { key: 'to_be_shipped', label: 'To be shipped',    color: 'bg-cyan-400',   Icon: Package      },
  { key: 'pending',       label: 'Pending orders',   color: 'bg-red-500',  Icon: CircleDashed },
  { key: 'completed',     label: 'Orders completed', color: 'bg-green-400',  Icon: CheckCircle  },
  { key: 'total',         label: 'Total orders',     color: 'bg-gray-900',  Icon: Star  },
  
]

// ── Types ─────────────────────────────────────────────────────
interface ProfileData {
  first_name:       string
  last_name:     string
  email:           string
  phone:           string
  delivery_address: string
  tinipoints:      number
}

interface OrderCounts {
  cart:          number
  in_transit:    number
  to_be_shipped: number
  total:         number
  pending:       number
  completed:     number
}

interface FavoriteProduct {
  product_id: string
  products: {
    id:         string
    name:       string
    price:      number
    image_urls: string[]
  }
}

export default function ProfilePage() {
  const navigate   = useNavigate()
  const profile    = useAuthStore(s => s.profile)
  const setProfile = useAuthStore(s => s.setProfile)
  const showToast  = useToastStore(s => s.showToast)
  const cartTotal  = useCartStore(selectCartItemCount)

  // ── Local state ───────────────────────────────────────────
  const [editing,      setEditing]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [showTooltip,  setShowTooltip]  = useState(false)
  const [orderCounts,  setOrderCounts]  = useState<Omit<OrderCounts, 'cart'>>({
    in_transit: 0, to_be_shipped: 0, pending : 0, completed: 0, total: 0 
  })
  const [favorites,    setFavorites]    = useState<FavoriteProduct[]>([])
  const [favLoading,   setFavLoading]   = useState(true)

  // Edit form fields — seeded from profile store
  const [formData, setFormData] = useState<ProfileData>({
    first_name:       profile?.first_name       ?? '',
    last_name:     profile?.last_name     ?? '',
    email:           profile?.email           ?? '',
    phone:           profile?.phone           ?? '',
    delivery_address : profile?.delivery_address ?? '',
    tinipoints:      profile?.tinipoints      ?? 0,
  })

  // Re-seed form if profile loads after mount
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name:       profile.first_name       ?? '',
        last_name:     profile.last_name     ?? '',
        email:           profile.email           ?? '',
        phone:           profile.phone           ?? '',
        delivery_address: profile.delivery_address ?? '',
        tinipoints:      profile.tinipoints      ?? 0,
      })
    }
  }, [profile])

  // Fetch order counts (cart count comes from useCartStore — same as nav badge)
  useEffect(() => {
    if (!profile?.id) return

    const fetchOrderData = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', profile.id)

      if (!orders) return

      setOrderCounts({
        in_transit:    orders.filter(o => o.status === 'in_transit').length,
        to_be_shipped: orders.filter(o => o.status === 'to_be_shipped').length,
        pending :      orders.filter(o => o.status === 'cart').length,
        completed:     orders.filter(o => o.status === 'completed').length,
        total:         orders.length,
      })
    }

    fetchOrderData()

    const orderChannel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'orders',
          filter: `user_id=eq.${profile.id}`,
        },
        () => fetchOrderData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
    }
  }, [profile?.id])

  // Fetch favorites with product details
  useEffect(() => {
    if (!profile?.id) return

    const fetchFavorites = async () => {
      setFavLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            image_urls
          )
        `)
        .eq('user_id', profile.id)
        .limit(6)

      if (!error && data) {
        setFavorites(data as FavoriteProduct[])
      }
      setFavLoading(false)
    }

    fetchFavorites()
  }, [profile?.id])

  // ── Save profile edits ────────────────────────────────────
  const handleSave = async () => {
    if (!profile?.id) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name:       formData.first_name,
        last_name:     formData.last_name,
        phone:           formData.phone,
        delivery_address: formData.delivery_address,
      })
      .eq('id', profile.id)

    if (error) {
      showToast('Failed to save changes', 'error')
    } else {
      // Update the Zustand store so navbar etc reflects new name immediately
      setProfile({ ...profile, ...formData })
      showToast('Profile updated successfully', 'success')
      setEditing(false)
    }

    setSaving(false)
  }

  const handleCancel = () => {
    // Reset form to current profile data, discard changes
    setFormData({
      first_name:       profile?.first_name       ?? '',
      last_name:     profile?.last_name     ?? '',
      email:           profile?.email           ?? '',
      phone:           profile?.phone           ?? '',
      delivery_address: profile?.delivery_address ?? '',
      tinipoints:      profile?.tinipoints      ?? 0,
    })
    setEditing(false)
  }

  // ── Shared input class ────────────────────────────────────
  const inputClass = `
    w-full px-3 py-2.5 text-sm rounded-xl outline-none
    bg-pink-50/50 border border-pink-100
    focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
    text-brand-charcoal transition-all duration-150
    disabled:bg-gray-50 disabled:text-brand-muted disabled:cursor-not-allowed
  `

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-brand-charcoal border-b-2 border-brand-charcoal pb-0.5">
          Profile
        </h2>

        {/* Edit / Cancel toggle */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-brand-muted hover:text-brand-charcoal border border-pink-100 rounded-xl hover:bg-pink-50 transition-colors"
          >
            <Edit3 size={14} strokeWidth={1.5} />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-muted hover:text-brand-charcoal border border-pink-100 rounded-xl hover:bg-pink-50 transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-brand-charcoal rounded-xl hover:bg-brand-charcoal/90 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} strokeWidth={1.5} />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      {/* ── Personal information card ────────────────────── */}
      <section>
        <h3 className="text-sm font-medium text-brand-charcoal mb-3">
          Personal information:
        </h3>

        <div className="bg-white rounded-2xl border border-pink-100 p-5 space-y-4">

          {/* Tinipoints — top right with tooltip */}
          <div className="flex justify-end">
            <div className="relative">
              <button
                onClick={() => setShowTooltip(t => !t)}
                className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                <Info size={13} strokeWidth={1.5} />
                Tinipoints:
                <span className="font-semibold text-brand-pink ml-0.5">
                  {formData.tinipoints}
                </span>
              </button>

              {/* Tooltip popup */}
              {showTooltip && (
                <div className="absolute right-0 top-7 z-10 w-56 bg-white border border-pink-100 rounded-xl shadow-lg p-3 text-xs text-brand-muted leading-relaxed">
                  <p className="font-medium text-brand-charcoal mb-1">What are Tinipoints?</p>
                  Every completed order earns you Tinipoints. Redeem them for discounts on future purchases.
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute top-2 right-2 text-brand-muted hover:text-brand-charcoal"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name row — two columns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-brand-muted flex items-center gap-1">
                <User size={11} strokeWidth={1.5} /> First name
              </label>
              <input
                className={inputClass}
                disabled={!editing}
                value={formData.first_name}
                onChange={e => setFormData(f => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-brand-muted flex items-center gap-1">
                <User size={11} strokeWidth={1.5} /> Second name
              </label>
              <input
                className={inputClass}
                disabled={!editing}
                value={formData.last_name}
                onChange={e => setFormData(f => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>

          {/* Email — never editable, Supabase owns this */}
          <div className="space-y-1">
            <label className="text-xs text-brand-muted flex items-center gap-1">
              <Mail size={11} strokeWidth={1.5} /> Email
            </label>
            <input
              className={inputClass}
              disabled
              value={formData.email}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs text-brand-muted flex items-center gap-1">
              <Phone size={11} strokeWidth={1.5} /> Contact
            </label>
            <input
              className={inputClass}
              disabled={!editing}
              value={formData.phone}
              onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
              placeholder="0712 345 678"
            />
          </div>

          {/* Delivery county */}
          <div className="space-y-1">
            <label className="text-xs text-brand-muted flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.5} /> Delivery county
            </label>
            {editing ? (
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={formData.delivery_address}
                  onChange={e => setFormData(f => ({ ...f, delivery_county: e.target.value }))}
                >
                  <option value="" disabled>Select county</option>
                  {COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted text-xs">▾</span>
              </div>
            ) : (
              <input
                className={inputClass}
                disabled
                value={formData.delivery_address || 'Not set'}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Orders information ───────────────────────────── */}
      <section>
        <h3 className="text-sm font-medium text-brand-charcoal mb-3">
          Orders information:
        </h3>

        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          {/* Status indicator row — matches wireframe color blocks */}
          <div className="grid grid-cols-6 gap-2">
            {ORDER_STATUSES.map(({ key, label, color, Icon: StatusIcon }) => (
              <button
                key={key}
                onClick={() => navigate(key === 'cart' ? '/cart' : '/orders')}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`
                  w-full aspect-square rounded-xl ${color}
                  flex items-center justify-center
                  group-hover:opacity-80 transition-opacity
                `}>
                  <StatusIcon size={18} strokeWidth={1.5} className="text-white" />
                </div>
                {/* count badge */}
                <span className="text-lg font-semibold text-brand-charcoal leading-none">
                  {key === 'cart' ? cartTotal : orderCounts[key as keyof typeof orderCounts]}
                </span>
                <span className="text-[10px] text-brand-muted text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Favorites ────────────────────────────────────── */}
      <section className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-brand-charcoal flex items-center gap-1.5">
            <Heart size={14} strokeWidth={1.5} className="text-brand-pink" />
            Favorites:
          </h3>
          {favorites.length > 0 && (
            <button className="text-xs text-brand-muted hover:text-brand-charcoal transition-colors">
              See all
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-4">
          {favLoading ? (
            // Skeleton loading — three placeholder cards
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square rounded-xl bg-pink-50 animate-pulse" />
                  <div className="h-3 bg-pink-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            // Empty state
            <div className="py-8 flex flex-col items-center gap-2">
              <Heart size={28} strokeWidth={1} className="text-pink-200" />
              <p className="text-sm text-brand-muted">No favourites yet</p>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-brand-pink hover:underline mt-1"
              >
                Browse products
              </button>
            </div>
          ) : (
            // Favorites grid
            <div className="grid grid-cols-3 gap-3">
              {favorites.map(fav => (
                <button
                  key={fav.product_id}
                  onClick={() => navigate(`/product/${fav.product_id}`)}
                  className="group text-left space-y-1.5"
                >
                  {/* Product image */}
                  <div className="aspect-square rounded-xl overflow-hidden bg-pink-50">
                    {fav.products?.image_urls?.[0] ? (
                      <img
                        src={fav.products.image_urls[0]}
                        alt={fav.products.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-pink-200" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-brand-charcoal font-medium truncate">
                    {fav.products?.name}
                  </p>
                  <p className="text-xs text-brand-muted">
                    KES {fav.products?.price?.toLocaleString('en-KE')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}