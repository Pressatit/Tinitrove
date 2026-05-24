import { Outlet } from 'react-router-dom'
import TopBar         from './Topbar'
import BottomNav      from './Bottomnav'
import DesktopSidebar from './DesktopSidebar'
import { useAuth }    from '@/hooks/useAuth'

/**
 * AppShell — single codebase, two layouts
 * Mobile  (<lg): TopBar + content + BottomNav
 * Desktop (≥lg): Fixed DesktopSidebar + TopBar + content
 */
export default function AppShell() {
  useAuth()
  return (
    <div className="min-h-screen bg-brand-cream">
      <DesktopSidebar />
      <div className="lg:ml-60">
        <TopBar />
        <main className="pb-24 lg:pb-8 px-4 lg:px-8 max-w-5xl mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
