import { useEffect, useState } from 'react'
import { Search, Pencil, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useDebounce } from '@/hooks/useDebounce'

interface UserRow {
  id:              string
  first_name:       string | null
  last_name:     string | null
  email:           string
  phone:           string | null
  delivery_address: string | null
  role:            string
  tinipoints:      number
  created_at:      string
  order_count:     number
}

export default function AdminUsers() {
  const [users,     setUsers]     = useState<UserRow[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [editId,    setEditId]    = useState<string | null>(null)
  const [editRole,  setEditRole]  = useState('')
  const [saving,    setSaving]    = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const fetchUsers = async () => {
    setLoading(true)

    // Fetch profiles + order count per user
    let query = supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, email,
        phone, delivery_address,role, tinipoints, created_at
      `)
      .order('created_at', { ascending: false })

    if (debouncedSearch) {
      query = query.or(
        `first_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`
      )
    }

    const { data: profiles } = await query

    if (!profiles) { setLoading(false); return }

    // Fetch order counts and roles from auth metadata via RPC
    // We store role in user_metadata so we need to read it differently
    // For now read role from a separate approach — fetch all users via admin
   const shaped: UserRow[] = (profiles ?? []).map(p => ({
  id:               p?.id ?? '',
  first_name:       p?.first_name ?? '',   // Maps 'first_name' to 'full_name'
  last_name:      p?.last_name ?? '',    // Maps 'last_name' to 'second_name'
  email:            p?.email ?? '',
  phone:            p?.phone ?? '',
  delivery_address: p?.delivery_address ?? '',
  tinipoints:       p?.tinipoints ?? 0,
  created_at:       p?.created_at ?? '',
  role:             p?.role ?? '',            // Overwritten below if needed
  order_count:      0,                     // Computed below
}))

    // Fetch order counts per user
    const { data: orderCounts } = await supabase
      .from('orders')
      .select('user_id')

    if (orderCounts) {
      const countMap: Record<string, number> = {}
      orderCounts.forEach(o => {
        if (o.user_id) {
      countMap[o.user_id] = (countMap[o.user_id] ?? 0) + 1
    }
  })
  shaped.forEach(u => { 
    if (u.id) {
      u.order_count = countMap[u.id] ?? 0 
    }
  })
}

    setUsers(shaped)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [debouncedSearch])

  const handleSaveRole = async (userId: string) => {
    setSaving(true)

    // Update role in auth.users user_metadata via admin API
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: editRole }
    })

    if (error) {
      alert('Failed to update role: ' + error.message)
    } else {
      setUsers(u => u.map(user =>
        user.id === userId ? { ...user, role: editRole } : user
      ))
      setEditId(null)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-brand-charcoal">Users</h1>
        <p className="text-sm text-brand-muted mt-0.5">{users.length} registered users</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['#','First name','Last name','Phone','Email','County','Orders','Tinipoints','Role',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-brand-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-brand-muted text-xs">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-brand-charcoal whitespace-nowrap">
                        {user.first_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-brand-charcoal whitespace-nowrap">
                        {user.last_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                        {user.phone ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-brand-muted">
                        <span className="truncate block max-w-[160px]">{user.email}</span>
                      </td>
                      <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                        {user.delivery_address ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-charcoal">
                        {user.order_count}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-charcoal">
                        {user.tinipoints}
                      </td>
                      <td className="px-4 py-3">
                        {editId === user.id ? (
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value)}
                            className="text-xs border border-pink-100 rounded-lg px-2 py-1 outline-none focus:border-brand-pink"
                          >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={`
                            text-xs px-2.5 py-1 rounded-full font-medium
                            ${user.role === 'admin'
                              ? 'bg-pink-50 text-brand-pink'
                              : 'bg-gray-100 text-brand-muted'}
                          `}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editId === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSaveRole(user.id)}
                              disabled={saving}
                              className="p-1.5 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
                            >
                              <Check size={13} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:bg-gray-200 transition-colors"
                            >
                              <X size={13} strokeWidth={2} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditId(user.id); setEditRole(user.role) }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted transition-colors"
                          >
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                        )}
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