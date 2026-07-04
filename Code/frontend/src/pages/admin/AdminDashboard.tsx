import { useEffect, useState } from 'react'
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Stats {
  totalUsers:    number
  totalProducts: number
  totalOrders:   number
  revenue:       number
  pendingOrders: number
  lowStock:      number
}

function StatCard({
  label, value, sub, icon: Icon, color
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} strokeWidth={1.5} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-2xl font-semibold text-brand-charcoal font-display mt-0.5">
          {value}
        </p>
        {sub && <p className="text-xs text-brand-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: users },
        { count: products },
        { data: orders },
        { count: lowStock },] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount, status, payment_status'),
        supabase.from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock_count', 5)
          .gt('stock_count', 0),
      ])

      const revenue = orders
        ?.filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0) ?? 0

      const pending = orders?.filter(o => o.status === 'cart').length ?? 0

      setStats({
        totalUsers:    users    ?? 0,
        totalProducts: products ?? 0,
        totalOrders:   orders?.length ?? 0,
        revenue,
        pendingOrders: pending,
        lowStock:      lowStock ?? 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Overview</h1>
        <p className="text-sm text-brand-muted mt-0.5">TiniTrove admin dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="bg-blue-400"
        />
        <StatCard
          label="Total products"
          value={stats?.totalProducts ?? 0}
          sub={`${stats?.lowStock} low stock`}
          icon={Package}
          color="bg-brand-pink"
        />
        <StatCard
          label="Total orders"
          value={stats?.totalOrders ?? 0}
          sub={`${stats?.pendingOrders} pending payment`}
          icon={ShoppingBag}
          color="bg-yellow-400"
        />
        <StatCard
          label="Total revenue"
          value={`KES ${(stats?.revenue ?? 0).toLocaleString('en-KE')}`}
          sub="Paid orders only"
          icon={TrendingUp}
          color="bg-green-400"
        />
      </div>
    </div>
  )
}