import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

export default function ResetPassword() {
  const navigate   = useNavigate()
  const showToast  = useToastStore(s => s.showToast)

  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [validLink,  setValidLink]  = useState(false)
  const [checking,   setChecking]   = useState(true)

  useEffect(() => {
    // Supabase fires onAuthStateChange with event 'PASSWORD_RECOVERY'
    // when the user arrives from the reset email link
    // This confirms the link is valid before showing the form
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setValidLink(true)
        }
        setChecking(false)
      }
    )

    // Safety timeout — if no event fires in 3s, link is invalid
    const timeout = setTimeout(() => setChecking(false), 100000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    // Supabase uses the session from the email link to update the password
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    showToast('Password updated successfully', 'success')
    // Sign out and redirect to login so they sign in fresh
    await supabase.auth.signOut()
    navigate('/login')
  }

  const inputClass = `
    w-full pl-9 pr-10 py-3 text-sm rounded-xl outline-none
    bg-pink-50/50 border border-pink-100
    focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
    placeholder:text-brand-muted/60 transition-all duration-150
  `

  // ── Checking if link is valid ─────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-pink-200 border-t-brand-pink rounded-full animate-spin" />
      </div>
    )
  }

  // ── Invalid or expired link ───────────────────────────────
  if (!validLink) {
    return (
      <div className="min-h-screen bg-brand-cream flex justify-center overflow-y-auto">
        <div className="w-full lg:w-[440px] lg:my-10 bg-white lg:rounded-2xl lg:border lg:border-pink-100 px-6 py-12 lg:px-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <Lock size={28} strokeWidth={1} className="text-red-400" />
          </div>
          <h2 className="font-display text-2xl text-brand-charcoal">Link expired</h2>
          <p className="text-sm text-brand-muted mt-2 leading-relaxed">
            This password reset link is invalid or has expired. Reset links are valid for 1 hour.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="mt-6 px-6 py-3 rounded-xl text-sm font-medium bg-brand-charcoal text-white hover:bg-brand-charcoal/90 transition-colors"
          >
            Request a new link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream flex justify-center overflow-y-auto">
      <div className="w-full lg:w-[440px] lg:my-10 bg-white lg:rounded-2xl lg:border lg:border-pink-100 lg:shadow-sm px-6 py-12 lg:px-10 lg:py-12 flex flex-col">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-tight text-brand-charcoal">
            TiniTrove 🎀
          </h1>
          <p className="text-xs text-brand-muted italic mt-1.5">
            Get it for them or …practice self love
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-brand-charcoal">Set new password</h2>
          <p className="text-sm text-brand-muted mt-1">Choose a strong password</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-5">

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-charcoal">
              New password
            </label>
            <div className="relative">
              <Lock size={16} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                {showPass
                  ? <EyeOff size={16} strokeWidth={1.5} />
                  : <Eye    size={16} strokeWidth={1.5} />
                }
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-charcoal">
              Confirm password
            </label>
            <div className="relative">
              <Lock size={16} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className={inputClass}
              />
              {/* Match indicator */}
              {confirm && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirm
                    ? <CheckCircle size={16} strokeWidth={1.5} className="text-green-500" />
                    : <span className="text-xs text-red-400">✗</span>
                  }
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2
              py-3.5 rounded-xl text-sm font-medium
              bg-brand-charcoal text-white
              hover:bg-brand-charcoal/90
              disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading
              ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              : <Lock    size={16} strokeWidth={1.5} />
            }
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}