import { Outlet } from 'react-router-dom'
import TopBar         from './Topbar'
import BottomNav      from './Bottomnav'
import DesktopSidebar from './DesktopSidebar'
import MobileDrawer  from './Mobiledrawer'
import { useCartSync } from '@/hooks/useCart'

/**
 * AppShell — single codebase, two layouts
 * Mobile  (<lg): TopBar + content + BottomNav
 * Desktop (≥lg): Fixed DesktopSidebar + TopBar + content
 */
export default function AppShell() {
  useCartSync()

  return (
    <div className="min-h-screen bg-brand-cream">
      <DesktopSidebar />
      <MobileDrawer />
      
      <div className="lg:ml-60 min-h-screen">
        <TopBar />
       <main className="pb-24 lg:pb-8 px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
