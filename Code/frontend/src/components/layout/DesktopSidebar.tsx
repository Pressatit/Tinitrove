import { NavLink, Link,useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authstore'
import { supabase } from '@/lib/supabaseClient'
import { Home, Search, ShoppingCart, User, LogOut, Info } from 'lucide-react'
import { useToastStore } from '@/stores/toaststore'

const NAV = [
  { to: '/',        label: 'Home page', Icon: Home },
  { to: '/search',  label: 'Search',   Icon: Search },
  { to: '/cart',    label: 'Cart',     Icon: ShoppingCart },
  { to: '/profile', label: 'Profile',  Icon: User },
]

export default function DesktopSidebar() {
  const reset = useAuthStore(s => s.reset)
  const navigate =useNavigate()
  const showToast = useToastStore(s => s.showToast)
  const handleLogout = async () => { await supabase.auth.signOut(); reset(); navigate('/'); showToast('Logged Out successfully!','success')}

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60
                       bg-white border-r border-pink-100 z-40 px-5 py-6 [box-shadow:1px_0_0_0_#fce7f3]">
      <Link to="/" className="mb-2 block">
        <h1 className="font-display text-xl leading-tight">Tini-Menu </h1>
        <p className="text-xs text-brand-muted italic mt-1">
          ---------------
        </p>
      </Link>

      <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
               ${isActive ? 'bg-pink-50 text-brand-pink font-medium' : 'text-brand-charcoal hover:bg-pink-50'}`}>
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                {label}
              </>
            )}           
          </NavLink>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="border-t border-pink-100 pt-4 space-y-1">
        <p className="text-[10px] text-brand-muted font-medium uppercase tracking-widest px-3 mb-2">
          Quick actions
        </p>

        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-3 py-2
            text-sm text-red-400 hover:bg-red-50 rounded-xl transition-colors
          "
        >
          {/* CHANGED: was text-only, now has LogOut icon */}
          <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
          Logout
        </button>

        <NavLink
          to="/about"
          className="
            flex items-center gap-3 px-3 py-2
            text-sm text-brand-muted hover:bg-pink-50 rounded-xl transition-colors
          "
        >
          {/* CHANGED: was text-only, now has Info icon */}
          <Info size={16} strokeWidth={1.5} aria-hidden="true" />
          About us
        </NavLink>
      </div>
    </aside>
  )
}