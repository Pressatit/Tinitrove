import { Routes, Route } from 'react-router-dom'
import AppShell     from '@/components/layout/Appshell'
import HomePage     from '@/pages/HomePage'
import SearchPage   from '@/pages/SearchPage'
import ProductPage  from '@/pages/ProductPage'
import CartPage     from '@/pages/CartPage'
import ProfilePage  from '@/pages/ProfilePage'
import AboutPage    from '@/pages/AboutPage'
import LoginPage    from '@/pages/LoginPage'
import CheckoutPage from '@/pages/CheckoutPage'
import NotFoundPage from '@/pages/Notfound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/"               element={<HomePage />} />
        <Route path="/search"         element={<SearchPage />} />
        <Route path="/product/:id"    element={<ProductPage />} />
        <Route path="/category/:slug" element={<SearchPage />} />
        <Route path="/cart"           element={<CartPage />} />
        <Route path="/checkout"       element={<CheckoutPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="*"               element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
