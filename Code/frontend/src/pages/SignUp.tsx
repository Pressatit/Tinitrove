import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, UserPlus,Gift } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToastStore } from '@/stores/toaststore'

// Kenya counties for the delivery address dropdown
const COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang\'a',
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

export default function SignUpPage() {
  const navigate = useNavigate()
  const showToast =useToastStore(s=>s.showToast)

  const [firstName,  setFirstName]  = useState('')
  const [secondName, setSecondName] = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [county,     setCounty]     = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    // Step 1: Create auth record
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: secondName,
          phone: phone,
          delivery_address: county,
        },
      },
    })

    if (authError) {
      setError(`Auth Error: ${authError.message}`)
      setLoading(false)
      return
    }

    // CRITICAL: Pull the ID aggressively from whatever authData returns
    const targetUserId = authData?.user?.id 

    console.log("Auth signup payload received:", authData)
    console.log("Extracted User ID:", targetUserId)

    if (!targetUserId) {
      // If this fires, email confirmation is active or the account is pending validation
      setError("Account creation pending. Please check your email inbox for a verification link before signing in.")
      setLoading(false)
      return
    }

    // Step 2: Push the public profile row explicitly
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: targetUserId,
        first_name: firstName,
        last_name: secondName,
        email: email,
        phone: phone,
        delivery_address: county
      })

    if (profileError) {
      console.error("Profile insertion database error:", profileError)
      setError(`Auth succeeded, but profile failed: ${profileError.message}`)
      setLoading(false)
      return
    }

    showToast('Signed up successfully!', 'success')
    navigate('/')

  } catch (err: any) {
    console.error("Unexpected signup workflow failure:", err)
    setError(`Unexpected error: ${err.message || err}`)
  } finally {
    setLoading(false)
  }
}

  return (
    // Same responsive pattern as LoginPage:
    // full screen on mobile, centred card on desktop
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-0 lg:p-6">

      <div className="
        w-full min-h-screen lg:min-h-0
        lg:w-[440px] lg:rounded-2xl
        bg-white lg:border lg:border-pink-100 lg:shadow-sm
        flex flex-col justify-center
        px-6 py-12 lg:px-10 lg:py-12
      ">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="flex items-center justify-center gap-1 font-display leading-none text-3xl tracking-tight">
            <Gift size={24} className='text-brand-pink' strokeWidth={2} />
            TiniTrove </h1>
          <p className="text-xs text-brand-muted italic mt-1.5">
            ------------
          </p>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-brand-charcoal">Create account</h2>
          <p className="text-sm text-brand-muted mt-1">Join TiniTrove today</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">

          {/* First name + Second name — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-medium text-brand-charcoal">
                First name
              </label>
              <div className="relative">
                <User
                  size={16} strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="
                    w-full pl-9 pr-3 py-3 text-sm
                    bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                    focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                    placeholder:text-brand-muted/60 transition-all duration-150
                  "
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="secondName" className="text-sm font-medium text-brand-charcoal">
                Second name
              </label>
              <div className="relative">
                <User
                  size={16} strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
                <input
                  id="secondName"
                  type="text"
                  required
                  value={secondName}
                  onChange={e => setSecondName(e.target.value)}
                  placeholder="Doe"
                  className="
                    w-full pl-9 pr-3 py-3 text-sm
                    bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                    focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                    placeholder:text-brand-muted/60 transition-all duration-150
                  "
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-brand-charcoal">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16} strokeWidth={1.5}
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
                  bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60 transition-all duration-150
                "
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-brand-charcoal">
              Phone number
            </label>
            <div className="relative">
              <Phone
                size={16} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0712345678"
                className="
                  w-full pl-9 pr-4 py-3 text-sm
                  bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60 transition-all duration-150
                "
              />
            </div>
          </div>

          {/* Delivery county dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="county" className="text-sm font-medium text-brand-charcoal">
              Delivery county
            </label>
            <div className="relative">
              <MapPin
                size={16} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <select
                id="county"
                required
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="
                  w-full pl-9 pr-4 py-3 text-sm appearance-none
                  bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  text-brand-charcoal transition-all duration-150
                  cursor-pointer
                "
              >
                <option value="" disabled>Select your county</option>
                {COUNTIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {/* Custom dropdown chevron */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted text-xs">
                ▾
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-brand-charcoal">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="
                  w-full pl-9 pr-10 py-3 text-sm
                  bg-pink-50/50 border border-pink-100 rounded-xl outline-none
                  focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20
                  placeholder:text-brand-muted/60 transition-all duration-150
                "
              />
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
            </div>
          </div>

          <div className="text-xs text-brand-muted text-center mt-2 mb-4">
            By creating an account, you agree to TiniTrove's{' '}
            <Link to="/terms-of-service" target="_blank" className="text-brand-pink hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" target="_blank" className="text-brand-pink hover:underline font-medium">
              Privacy Policy
            </Link>.
          </div>
          


          {/* Submit */}
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
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} strokeWidth={1.5} />
                Create account
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-brand-muted mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-pink font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}