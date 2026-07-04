import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Users, Tag, Package, ShoppingBag,
  Image, ChevronLeft, ChevronRight,
  LogOut, LayoutDashboard
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'

// ── Sidebar nav structure matching your wireframe ─────────────
const NAV = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    ]
  },
  {
    section: 'Users',
    items: [
      { label: 'View all users',       to: '/admin/users',           icon: Users },
      
    ]
  },
  {
    section: 'Categories',
    items: [
      { label: 'View all categories',  to: '/admin/categories',      icon: Tag   },
      
    ]
  },
  {
    section: 'Products',
    items: [
      { label: 'View all products',    to: '/admin/products',        icon: Package },
      { label: 'Add product',          to: '/admin/products/add',    icon: Package },
    ]
  },
  {
    section: 'Orders',
    items: [
      { label: 'View all orders',      to: '/admin/orders',          icon: ShoppingBag },
    ]
  },
  {
    section: 'Banners',
    items: [
      { label: 'View all banners',     to: '/admin/banners',         icon: Image },
      
    ]
  },
]

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false)
  const reset    = useAuthStore(s => s.reset)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    reset()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`
        flex flex-col bg-white border-r border-gray-200
        transition-all duration-200 shrink-0
        ${collapsed ? 'w-14' : 'w-64'}
      `}>

        {/* Logo + collapse button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && (
            <div>
              <p className="font-display text-lg text-brand-charcoal leading-none">
                TiniTrove 🎀
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5">Admin Portal</p>
            </div>
          )}
          {/* << >> collapse toggle matching wireframe */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-muted transition-colors ml-auto"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={16} strokeWidth={1.5} />
              : <ChevronLeft  size={16} strokeWidth={1.5} />
            }
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest px-2 mb-1">
                  {section}
                </p>
              )}
              {items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm
                    transition-colors duration-150 mb-0.5
                    ${isActive
                      ? 'bg-pink-50 text-brand-pink font-medium'
                      : 'text-brand-charcoal hover:bg-gray-50'}
                  `}
                >
                  <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}