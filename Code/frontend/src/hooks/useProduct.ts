import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '@/types'
import { getTimeBucketSeed,shuffleWithPinned } from '@/lib/shuffle'

interface ProductFilter {
  category_slug?: string   // for /category/:slug routes
  is_new_arrival?: boolean
  is_hot_deal?: boolean
  search?: string
  limit?: number
  shuffle?:ShuffleOptions
}

interface ShuffleOptions {
  enabled: boolean
  salt?: number
  pinnedCount?: number
  poolLimit?: number
  intervalMinutes?: number
}

export function useProducts(filter?: ProductFilter) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const shuffleEnabled  = filter?.shuffle?.enabled ?? false
  const shuffleSalt     = filter?.shuffle?.salt ?? 0
  const pinnedCount     = filter?.shuffle?.pinnedCount ?? 0
  const poolLimit       = filter?.shuffle?.poolLimit ?? 40
  const intervalMinutes = filter?.shuffle?.intervalMinutes ?? 15

  useEffect(() => {
    setLoading(true)
    setError(null)

    const run = async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories ( name, slug )
        `)
        .eq('is_active', true)

      // Text search — case insensitive match on product name
      if (filter?.search) {

        const searchTerm = `%${filter.search}%`

        const tagSearch = `{${filter.search}}`

        query = query.or(`name.ilike.${searchTerm}, tags.cs.${tagSearch}`)
      }

      // Category filter — join through categories table by slug
      if (filter?.category_slug) {
        // First get the category id from the slug
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filter.category_slug)
          .single()

        if (cat) {
          query = query.eq('category_id', cat.id)
        }
      }

      if (filter?.is_new_arrival) query = query.eq('is_new_arrival', true)
      if (filter?.is_hot_deal)    query = query.eq('is_hot_deal', true)
      
      query = query.order('created_at', { ascending: false })

      if (shuffleEnabled) {
        query = query.limit(poolLimit)
      } else if (filter?.limit) {
        query = query.limit(filter.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      let finalProducts = (data ?? []) as Product[]

      if (shuffleEnabled){
          const seed=getTimeBucketSeed(intervalMinutes,shuffleSalt)
          finalProducts=shuffleWithPinned(finalProducts,seed,pinnedCount)
        }

      if (filter?.limit) {
          finalProducts = finalProducts.slice(0, filter.limit)
        }

      setProducts(finalProducts)
      setLoading(false)
    }

    run()
  }, [
    // Re-run whenever any filter value changes
    filter?.search,
    filter?.category_slug,
    filter?.is_new_arrival,
    filter?.is_hot_deal,
    filter?.limit,
    shuffleEnabled,
    shuffleSalt,
    intervalMinutes,
    pinnedCount,
    poolLimit
  ])

  return { products, loading, error }
}