import { useEffect, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'
import { useDebounce } from '@/hooks/useDebounce'

interface AdminOrder {
  id:               string
  user_id:          string
  status:           string
  total_amount:     number
  payment_status:   string
  delivery_address: string
  created_at:       string
  profiles: { first_name: string | null; email: string } | null
  item_count: number
}

const STATUS_OPTIONS = ['cart', 'in_transit', 'to_be_shipped', 'completed']
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed']

const STATUS_COLORS: Record<string, string> = {
  cart:          'bg-red-50 text-red-400',
  in_transit:    'bg-yellow-50 text-yellow-600',
  to_be_shipped: 'bg-cyan-50 text-cyan-600',
  completed:     'bg-green-50 text-green-600',
}
const PAYMENT_COLORS: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-500',
  paid:    'bg-green-50 text-green-600',
  failed:  'bg-red-50 text-red-400',
}

export default function AdminOrders() {
  const showToast = useToastStore(s => s.showToast)

  const [orders,  setOrders]  = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 400)

  const fetchOrders = async () => {
  setLoading(true)

  // Catch the explicit error object to see exactly what PostgREST complains about
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, 
      user_id, 
      status, 
      total_amount,
      payment_status, 
      delivery_address, 
      created_at,
      profiles!user_id ( first_name, email ),
      order_items!order_id ( id )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase Query Error:", error.message, error.details)
    showToast(`Error fetching orders: ${error.message}`, 'error')
    setLoading(false)
    return
  }

  if (!data) { setLoading(false); return }

  const shaped: AdminOrder[] = data.map((o: any) => ({
    ...o,
    item_count: o.order_items?.length ?? 0,
  }))

  const filtered = debouncedSearch
    ? shaped.filter(o =>
        o.profiles?.email?.includes(debouncedSearch) ||
        o.profiles?.first_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.id.includes(debouncedSearch)
      )
    : shaped

  setOrders(filtered)
  setLoading(false)
}

  useEffect(() => { fetchOrders() }, [debouncedSearch])

  const updateStatus = async (orderId: string, field: 'status' | 'payment_status', value: string) => {
    setUpdating(orderId + field)
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value } as any)
      .eq('id', orderId)

    if (error) {
      showToast('Failed to update order', 'error')
    } else {
      showToast('Order updated', 'success')
      setOrders(o => o.map(order =>
        order.id === orderId ? { ...order, [field]: value } : order
      ))
    }
    setUpdating(null)
  }

  const selectClass = "text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-pink bg-white cursor-pointer"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Orders</h1>
        <p className="text-sm text-brand-muted mt-0.5">{orders.length} orders</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or order ID…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['#','Order ref','Customer','Items','Amount','Status','Payment','Date',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order, index) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-brand-muted text-xs">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-charcoal">
                        {order.id.replace(/-/g, '').slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-charcoal text-xs whitespace-nowrap">
                          {order.profiles?.first_name ?? 'Unknown'}
                        </p>
                        <p className="text-brand-muted text-[10px]">
                          {order.profiles?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center text-brand-charcoal">
                        {order.item_count}
                      </td>
                      <td className="px-4 py-3 text-brand-charcoal whitespace-nowrap">
                        KES {order.total_amount.toLocaleString('en-KE')}
                      </td>
                      {/* Inline status dropdown */}
                      <td className="px-4 py-3">
                        {updating === order.id + 'status'
                          ? <Loader2 size={14} className="animate-spin text-brand-muted" />
                          : (
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, 'status', e.target.value)}
                              className={`${selectClass} ${STATUS_COLORS[order.status]}`}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          )
                        }
                      </td>
                      {/* Inline payment status dropdown */}
                      <td className="px-4 py-3">
                        {updating === order.id + 'payment_status'
                          ? <Loader2 size={14} className="animate-spin text-brand-muted" />
                          : (
                            <select
                              value={order.payment_status}
                              onChange={e => updateStatus(order.id, 'payment_status', e.target.value)}
                              className={`${selectClass} ${PAYMENT_COLORS[order.payment_status]}`}
                            >
                              {PAYMENT_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )
                        }
                      </td>
                      <td className="px-4 py-3 text-brand-muted text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}