import { useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Home, Search, ShoppingCart, User, LogOut, Info, X } from 'lucide-react'
import { useUiStore } from '@/stores/uistore'
import { useAuthStore } from '@/stores/authstore'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

const NAV = [
  { to: '/',        label: 'Home page', Icon: Home         },
  { to: '/search',  label: 'Search',   Icon: Search       },
  { to: '/cart',    label: 'Cart',     Icon: ShoppingCart },
  { to: '/profile', label: 'Profile',  Icon: User         },
]

export default function MobileDrawer() {
  const { sidebarOpen, closeSidebar } = useUiStore()
  const reset    = useAuthStore(s => s.reset)
  const showToast = useToastStore(s=>s.showToast)
  const navigate = useNavigate()

  // Close drawer when route changes — so tapping a link closes it
  // Also lock body scroll when drawer is open so background doesn't scroll
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleLogout = async () => {
    closeSidebar()
    await supabase.auth.signOut()
    reset()
    showToast('Logged out Successfully','success')
    navigate('/')
    
  }

  const handleNavClick = () => {
    // Small delay so the user sees the tap before the drawer closes
    setTimeout(closeSidebar, 150)
  }

  return (
    // Only renders on mobile — lg:hidden
    <div className="lg:hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop — dark overlay behind the drawer */}
            {/* tapping it closes the drawer */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer panel — slides in from the right */}
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                fixed top-0 right-0 bottom-0 z-50
                w-72 bg-white
                flex flex-col
                px-5 py-6
                shadow-xl
              "
            >
              {/* Header row — logo + close button */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={handleNavClick}>
                  <h1 className="font-display text-xl leading-tight text-brand-charcoal">
                    Tini-menu
                  </h1>
                  <p className="text-xs text-brand-muted italic mt-0.5">
                    ---------------
                  </p>
                </Link>

                {/* Close button */}
                <button
                  onClick={closeSidebar}
                  className="p-2 -mr-2 text-brand-muted hover:text-brand-charcoal transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav links — same structure as DesktopSidebar */}
              <nav className="flex flex-col gap-1 flex-1" aria-label="Mobile navigation">
                {NAV.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={handleNavClick}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors
                      ${isActive
                        ? 'bg-pink-50 text-brand-pink font-medium'
                        : 'text-brand-charcoal hover:bg-pink-50'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Quick actions at the bottom */}
              <div className="border-t border-pink-100 pt-4 space-y-1">
                <p className="text-[10px] text-brand-muted font-medium uppercase tracking-widest px-3 mb-2">
                  Quick actions
                </p>

                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-3 px-3 py-2.5
                    text-sm text-red-400 hover:bg-red-50 rounded-xl transition-colors
                  "
                >
                  <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
                  Logout
                </button>

                <NavLink
                  to="/about"
                  onClick={handleNavClick}
                  className="
                    flex items-center gap-3 px-3 py-2.5
                    text-sm text-brand-muted hover:bg-pink-50 rounded-xl transition-colors
                  "
                >
                  <Info size={16} strokeWidth={1.5} aria-hidden="true" />
                  About us
                </NavLink>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}