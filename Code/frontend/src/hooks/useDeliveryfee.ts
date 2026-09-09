// src/hooks/useDeliveryFee.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface DeliveryZone {
  county:  string
  area:    string | null
  fee:     number
}

export function useDeliveryFee(county: string) {
  const [zone,    setZone]    = useState<DeliveryZone | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!county) {
      setZone(null)
      return
    }

    setLoading(true)
    setError(null)

    supabase
      .from('delivery_zones')
      .select('county, area, fee')
      .eq('county', county)
      .single()
      .then(({ data, error }) => {
        if (error) {
          // County not in delivery zones — not serviceable
          setError('We do not currently deliver to this county yet...')
          setZone(null)
        } else {
          setZone(data)
        }
        setLoading(false)
      })
  }, [county])

  return {
    fee:           zone?.fee ?? null,
    area:          zone?.area ?? null,
    isServiceable: zone !== null && !error,
    loading,
    error,
  }
}