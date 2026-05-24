import { NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authstore'
import { supabase } from '@/lib/supabaseClient'

const NAV = [
  { to: '/',        label: 'Home page', icon: '🏠' },
  { to: '/search',  label: 'Search',   icon: '🔍' },
  { to: '/cart',    label: 'Cart',     icon: '🛒' },
  { to: '/profile', label: 'Profile',  icon: '👤' },
]

export default function DesktopSidebar() {
  const reset = useAuthStore(s => s.reset)
  const handleLogout = async () => { await supabase.auth.signOut(); reset() }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60
                       bg-white border-r border-pink-100 z-40 px-5 py-6">
      <Link to="/" className="mb-8 block">
        <h1 className="font-display text-2xl leading-tight">TiniTrove 🎀</h1>
        <p className="text-xs text-brand-muted italic mt-1">
          MENU
        </p>
      </Link>

      <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
               ${isActive ? 'bg-pink-50 text-brand-pink font-medium' : 'text-brand-charcoal hover:bg-pink-50'}`}>
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="border-t border-pink-100 pt-4 space-y-1">
        <p className="text-[10px] text-brand-muted font-medium uppercase tracking-widest px-3 mb-2">
          Quick actions
        </p>
        <button onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-xl transition-colors">
          Logout
        </button>
        <NavLink to="/about"
          className="block px-3 py-2 text-sm text-brand-muted hover:bg-pink-50 rounded-xl transition-colors">
          About us
        </NavLink>
      </div>
    </aside>
  )
}
