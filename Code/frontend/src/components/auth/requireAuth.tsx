import { Navigate, Outlet ,useLocation} from 'react-router-dom'
import { useAuthStore } from '@/stores/authstore'

export default function RequireAuth() {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const location=useLocation()

  if (loading) return null
  // If no user in store, redirect to login
  // The Outlet renders the protected page if user exists
  if (!user) return <Navigate to="/login" state={{from:location}} replace />

  return <Outlet />
}