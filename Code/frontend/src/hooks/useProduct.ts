import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'

interface ProductFilter {
  category_slug?: string
  is_new_arrival?: boolean
  is_hot_deal?: boolean
  search?: string
  limit?: number
}

export function useProducts(filter?: ProductFilter) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('is_active', true)
    if (filter?.is_new_arrival) query = query.eq('is_new_arrival', true)
    if (filter?.is_hot_deal)    query = query.eq('is_hot_deal', true)
    if (filter?.search)         query = query.ilike('name', `%${filter.search}%`)
    if (filter?.limit)          query = query.limit(filter.limit)
    query.order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProducts(data as Product[])
        setLoading(false)
      })
  }, [JSON.stringify(filter)])

  return { products, loading, error }
}
