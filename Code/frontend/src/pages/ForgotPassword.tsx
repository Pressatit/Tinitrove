import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const redirectUrl = window.location.origin.includes('localhost') 
      ? `${window.location.origin}/reset-password`
      : 'https://www.tinitrove.co.ke/reset-password'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // After clicking the link in email, user lands here
      redirectTo: redirectUrl,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  // ── Success state ─────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen bg-brand-cream flex justify-center overflow-y-auto">
        <div className="w-full lg:w-[440px] lg:my-10 bg-white lg:rounded-2xl lg:border lg:border-pink-100 lg:shadow-sm px-6 py-12 lg:px-10 lg:py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
            <CheckCircle size={32} strokeWidth={1.5} className="text-green-500" />
          </div>
          <h2 className="font-display text-2xl text-brand-charcoal">Check your email</h2>
          <p className="text-sm text-brand-muted mt-2 leading-relaxed">
            We sent a password reset link to{' '}
            <span className="font-medium text-brand-charcoal">{email}</span>.
            Check your inbox and click the link to reset your password.
          </p>
          <p className="text-xs text-brand-muted mt-4">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-brand-pink hover:underline"
            >
              try again
            </button>
          </p>
          <Link
            to="/login"
            className="mt-8 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-charcoal transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to sign in
          </Link>
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

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-brand-charcoal">Forgot password?</h2>
          <p className="text-sm text-brand-muted mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-brand-charcoal">
              Email address
            </label>
            <div className="relative">
              <Mail size={16} strokeWidth={1.5}
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
                  w-full pl-9 pr-4 py-3 text-sm rounded-xl outline-none
                  bg-pink-50/50 border border-pink-100
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60 transition-all duration-150
                "
              />
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
            {loading ? (
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Mail size={16} strokeWidth={1.5} />
            )}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 mt-6 text-sm text-brand-muted hover:text-brand-charcoal transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}