import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

export default function LoginPage() {
  const navigate = useNavigate()
  const showToast =useToastStore(s=>s.showToast)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // auth listener in useAuth() will pick up the session automatically
    // navigate to home after successful login
    showToast('Logged in successfully','success')
    navigate('/')
    
    

  }

  return (
    // Full screen container — cream background matches the app shell
    // on mobile this fills the entire viewport
    // on desktop it centres the card
    <div className="min-h-screen bg-brand-cream flex justify-center overflow-y-auto p-0 lg:p-6 lg:items-center">

      {/* Card — full screen on mobile, fixed width centred on desktop */}
      <div className="
        w-full lg:w-[440px]
        bg-white lg:rounded-2xl
        lg:border lg:border-pink-100 lg:shadow-sm
        px-6 py-12 lg:px-10 lg:py-12
        flex flex-col
        lg:my-6

      ">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-tight">TiniTrove 🎀</h1>
          <p className="text-xs text-brand-muted italic mt-1.5">
            ------------
          </p>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-brand-charcoal">Welcome back</h2>
          <p className="text-sm text-brand-muted mt-1">Sign in to your account</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-brand-charcoal">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  w-full pl-9 pr-4 py-3 text-sm
                  bg-pink-50/50 border border-pink-100
                  rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60
                  transition-all duration-150
                "
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-brand-charcoal">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full pl-9 pr-10 py-3 text-sm
                  bg-pink-50/50 border border-pink-100
                  rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60
                  transition-all duration-150
                "
              />
              {/* Show/hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass
                  ? <EyeOff size={16} strokeWidth={1.5} />
                  : <Eye    size={16} strokeWidth={1.5} />
                }
              </button>
              <Link
               to="/forgot-password"
               className="text-xs text-brand-pink hover:underline" >
               Forgot password?
             </Link>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2
              py-3 rounded-xl text-sm font-medium
              bg-brand-charcoal text-white
              hover:bg-brand-charcoal/90
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-150
              mt-2
            "
          >
            {loading ? (
              // Simple spinner — no extra library needed
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} strokeWidth={1.5} />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-brand-muted mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-brand-pink font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}