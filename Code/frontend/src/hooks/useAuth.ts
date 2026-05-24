import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/authstore'

export function useAuth() {
  const { setUser, setSession, setProfile, reset } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single()
          setProfile(data)
        } else {
          reset()
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  return useAuthStore()
}
