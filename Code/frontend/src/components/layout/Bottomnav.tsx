import { NavLink } from 'react-router-dom'
import { useCartStore } from '@/stores/cartstore'


const NAV = [
  { to: '/',        label: 'Home',    icon: '🏠' },
  { to: '/search',  label: 'Search',  icon: '🔍' },
  { to: '/cart',    label: 'Cart',    icon: '🛒' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav() {
  const totalItems = useCartStore(s => s.getTotalItems())
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-pink-100
                    rounded-t-3xl shadow-lg pb-safe">
      <ul className="flex justify-around py-2">
        {NAV.map(({ to, label, icon }) => (
          <li key={to} className="relative">
            <NavLink to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-xs px-4 py-2 rounded-xl transition-colors
                 ${isActive ? 'text-brand-pink font-medium' : 'text-brand-muted'}`}>
              <span className="text-xl leading-none">{icon}</span>
              {label}
              {to === '/cart' && totalItems > 0 && (
                <span className="absolute top-1 right-2 bg-brand-pink text-white
                                 text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
