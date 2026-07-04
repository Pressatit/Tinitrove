import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authstore'

export default function RequireAdmin() {
  const user    = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const profile = useAuthStore(s => s.profile)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-pink-200 border-t-brand-pink rounded-full animate-spin" />
    </div>
  )

  // Not logged in at all → login page
  if (!user) return <Navigate to="/login" replace />

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-6 h-6 border-2 border-pink-200 border-t-brand-pink rounded-full animate-spin" />
    </div>
  )

  if (profile?.role == 'customer') return <Navigate to="/not-found" replace />

  return <Outlet />
}