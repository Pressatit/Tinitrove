import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'

export function useAuth() {
  const { setUser, setSession, setProfile, reset, setloading } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!data) {
      await supabase.auth.signOut() // Clears the bad local storage
      window.location.href = '/login' // Boots them out
      return
      }

      if (cancelled) return

      if (error) {
        console.warn('Profile fetch skipped or missing, keeping user session active.', error)
        setProfile(null)
        return
      }
      setProfile(data)
    }

    // 1. Init FIRST — finish before relying on the listener.
    // Never await supabase calls inside onAuthStateChange (causes auth lock deadlock).
    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (cancelled) return
        if (error) throw error

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Auth init failed', err)
      } finally {
        if (!cancelled) setloading(false)
      }
    }

    void init()

    // 2. Listener — sync callback only; defer any Supabase API calls.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return
        // Boot is handled by init(); avoid duplicate work + lock races.
        if (event === 'INITIAL_SESSION') return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          void fetchProfile(session.user.id)
        } else {
          reset()
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setProfile, reset, setloading])

  return useAuthStore()
}
