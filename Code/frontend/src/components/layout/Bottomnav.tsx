import { useNavigate,useLocation } from 'react-router-dom'
import { useCartStore, selectCartItemCount } from '@/stores/cartstore'
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

import { Home, Search, ShoppingCart, User } from 'lucide-react'


const NAV = [
  { to: '/',        label: 'Home',    icon: Home },
  { to: '/search',  label: 'Search',  icon: Search },
  { to: '/cart',    label: 'Cart',    icon: ShoppingCart },
  { to: '/profile', label: 'Profile', icon: User },
]
function DockIcon({to,label,Icon,mouseX,isActive,badge,}: {
  to: string
  label: string
  Icon: React.ElementType
  mouseX: MotionValue<number>
  isActive: boolean
  badge?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // NEW: distance measures how far this icon is from the cursor
  // when cursor is far away (Infinity), distance is large, icon stays at base size
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return 9999
    return val - (bounds.left + bounds.width / 2)
  })

  // NEW: maps distance to icon size — closest icon grows to 52px, others stay at 32px
  const widthRaw  = useTransform(distance, [-80, 0, 80], [32, 52, 32])
  const heightRaw = useTransform(distance, [-80, 0, 80], [32, 52, 32])

  // NEW: spring makes the size change feel physical, not instant
  const width  = useSpring(widthRaw,  { stiffness: 300, damping: 25 })
  const height = useSpring(heightRaw, { stiffness: 300, damping: 25 })

  return (
    <motion.div
      ref={ref}
      onClick={() => navigate(to)}
      style={{ width, height }}
      // CHANGED: was a NavLink, now a motion.div that navigates programmatically
      // this lets us control the size via motion style while keeping nav behaviour
      className={`
        relative flex flex-col items-center justify-center gap-1.5
        w-full min-h-[64px] text-xs transition-colors duration-150
        ${isActive ? 'text-brand-pink' : 'text-brand-muted'}
      `}
      whileTap={{ scale: 0.88 }}
      aria-label={label}
    >
      {/* CHANGED: was emoji <span>, now Lucide icon */}
      {/* strokeWidth is heavier when active to visually reinforce selection */}
      <Icon
        size={26}
        strokeWidth={isActive ? 2 : 1.5}
        aria-hidden="true"
      />

      {/* Cart badge — logic identical to before, position unchanged */}
      {badge !== undefined && badge > 0 && (
        <span className="
          absolute -top-1 -right-1
          bg-brand-pink text-white text-[9px] font-medium
          rounded-full w-4 h-4 flex items-center justify-center
          pointer-events-none
        ">
          {badge}
        </span>
      )}

      {/* NEW: animated dot under the active icon, shared layoutId so it slides */}
      {isActive && (
        <motion.span
          layoutId="dock-active-dot"
          className="absolute -bottom-2 w-1 h-1 rounded-full bg-brand-pink"
        />
      )}
    </motion.div>
  )
}

export default function BottomNav() {
  const location   = useLocation()
  const totalItems = useCartStore(selectCartItemCount)

  // NEW: single shared mouseX value passed to every DockIcon
  // when mouse leaves the dock it resets to Infinity so all icons return to base size
  const mouseX = useMotionValue(Infinity)

  return (
    // CHANGED: was fixed bottom-0 inset-x-0 (full-width tab bar)
    // now fixed bottom-4 left-1/2 -translate-x-1/2 (floating centred pill)
    <nav
      className="lg:hidden fixed bottom-7 left-4 right-4 z-40
        bg-white border-t border-pink-100
        rounded-3xl"
      aria-label="Main navigation"
    >
      <motion.div
        onMouseMove={e => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        // CHANGED: was plain white bar with border-t
        // now floating pill with blur background and soft shadow
        className="
          flex items-center justify-around w-full px-2
        "
      >
        {NAV.map(({ to, label, icon }) => {
          // CHANGED: was handled by NavLink's built-in isActive
          // now computed manually so DockIcon can use it for both styling and the dot
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to)

          return (
            <DockIcon
              key={to}
              to={to}
              label={label}
              Icon={icon}
              mouseX={mouseX}
              isActive={isActive}
              badge={to === '/cart' ? totalItems : undefined}
            />
          )
        })}
      </motion.div>
    </nav>
  )
}
