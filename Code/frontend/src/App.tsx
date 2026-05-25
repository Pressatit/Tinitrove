import { Routes, Route } from 'react-router-dom'
import AppShell     from '@/components/layout/Appshell'
import HomePage     from '@/pages/HomePage'
import SearchPage   from '@/pages/SearchPage'
import ProductPage  from '@/pages/ProductPage'
import CartPage     from '@/pages/CartPage'
import ProfilePage  from '@/pages/ProfilePage'
import AboutPage    from '@/pages/AboutPage'
import CheckoutPage from '@/pages/CheckoutPage'
import NotFoundPage from '@/pages/Notfound'

import SignUpPage from './pages/SignUp'
import LoginPage    from '@/pages/LoginPage'

import RequireAuth from './components/auth/requireAuth'
import { useAuth }    from '@/hooks/useAuth'
import { useAuthStore } from './stores/authstore'
    
import ToastContainer from './components/ui/toastcontainer'


function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth() // boots session check and auth listener here — runs once, before routes
  return <>{children}</>
}

export default function App() {
  const loading=useAuthStore(s=>s.loading)
  
  return (
    <AuthProvider>
     <ToastContainer />
     {loading ? (
        <div className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#FAF8F5' }}>
          <div className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: '#fce7f3', borderTopColor: '#F4A7B9' }} />
        </div>
      ) : (

      <Routes>
      {/* Public routes — no auth needed */}
       <Route path="/login"  element={<LoginPage />} />
       <Route path="/signup" element={<SignUpPage />} />

      {/* Semi-public — has shell but no auth required */}
      {/* homepage, search, product pages anyone can browse */}
       <Route element={<AppShell />}>
         <Route path="/"               element={<HomePage />} />
         <Route path="/search"         element={<SearchPage />} />
         <Route path="/product/:id"    element={<ProductPage />} />
         <Route path="/category/:slug" element={<SearchPage />} />
         <Route path="/about"          element={<AboutPage />} />

        {/* Protected — must be logged in */}
        {/* RequireAuth redirects to /login if no session */}
         <Route element={<RequireAuth />}>
           <Route path="/cart"     element={<CartPage />} />
           <Route path="/checkout" element={<CheckoutPage />} />
           <Route path="/profile"  element={<ProfilePage />} />
         </Route>

         <Route path="*" element={<NotFoundPage />} />
       </Route>
     </Routes>
    )}
    </AuthProvider>
  )
}
