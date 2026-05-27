import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore, type CartItemWithProduct } from '@/stores/cartstore'
import { useAuthStore } from '@/stores/authstore'
import { useToastStore } from '@/stores/toaststore'
import type { Product } from '@/types'

const CART_SELECT = `
  id,
  user_id,
  product_id,
  quantity,
  color_selected,
  added_at,
  products (
    id, name, price, stock_count,
    image_urls, color_variants, tags,
    is_active, is_hot_deal, is_new_arrival,
    category_id, description, created_at
  )
`

function shapeCartRows(
  data: Array<{
    id: string
    user_id: string
    product_id: string
    quantity: number
    color_selected: string | null
    added_at: string
    products: unknown
  }>
): CartItemWithProduct[] {
  return data
    .filter(row => {
      if (row.products === null) {
        console.warn('Cart row missing product join:', row.product_id)
        return false
      }
      return true
    })
    .map(row => ({
      id:             row.id,
      user_id:        row.user_id,
      product_id:     row.product_id,
      quantity:       row.quantity,
      color_selected: row.color_selected,
      added_at:       row.added_at,
      product:        row.products as Product,
    }))
}

async function loadCartFromDb(userId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from('cart')
    .select(CART_SELECT)
    .eq('user_id', userId)

  if (error) {
    console.error('fetchCart error:', error.message)
    return useCartStore.getState().items
  }

  if (!data) return []
  return shapeCartRows(data)
}

// ── Bootstrap: hydrate from DB + realtime sync (mount once in AppShell) ──
export function useCartSync() {
  const user        = useAuthStore(s => s.user)
  const authLoading = useAuthStore(s => s.loading)
  const setItems    = useCartStore(s => s.setItems)
  const clearCart   = useCartStore(s => s.clearCart)

  const fetchCart = useCallback(async () => {
    if (!user) return
    const items = await loadCartFromDb(user.id)
    setItems(items)
  }, [user, setItems])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      clearCart()
      return
    }

    void fetchCart()

    const channel = supabase
      .channel(`cart-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'cart',
          filter: `user_id=eq.${user.id}`,
        },
        () => { void fetchCart() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, authLoading, fetchCart, clearCart])
}

// ── Mutations: always write DB first, then mirror to store ──
export function useCartActions() {
  const user        = useAuthStore(s => s.user)
  const setItems    = useCartStore(s => s.setItems)
  const storeRemove = useCartStore(s => s.removeItem)
  const storeUpdate = useCartStore(s => s.updateQty)
  const storeClear  = useCartStore(s => s.clearCart)
  const showToast   = useToastStore(s => s.showToast)

  const fetchCart = useCallback(async () => {
    if (!user) return
    const items = await loadCartFromDb(user.id)
    setItems(items)
  }, [user, setItems])

  const addItem = async (product: Product, colorSelected: string | null = null) => {
    if (!user) {
      showToast('Sign in to add items to cart', 'info')
      return
    }

    const { data: existing, error: lookupError } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()

    if (lookupError) {
      showToast('Failed to add item', 'error')
      return
    }

    if (existing) {
      const newQty = existing.quantity + 1

      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQty })
        .eq('id', existing.id)

      if (error) {
        showToast('Failed to update cart', 'error')
        return
      }
    } else {
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id:        user.id,
          product_id:     product.id,
          quantity:       1,
          color_selected: colorSelected,
        })

      if (error) {
        showToast('Failed to add item', 'error')
        return
      }
    }

    await fetchCart()
    showToast(`${product.name} added to cart`, 'success')
  }

  const removeItem = async (productId: string, productName?: string) => {
    if (!user) return

    storeRemove(productId)

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      showToast('Failed to remove item', 'error')
      await fetchCart()
      return
    }

    if (productName) showToast(`${productName} removed`, 'info')
  }

  const updateQty = async (productId: string, qty: number) => {
    if (!user) return

    if (qty <= 0) {
      await removeItem(productId)
      return
    }

    storeUpdate(productId, qty)

    const { error } = await supabase
      .from('cart')
      .update({ quantity: qty })
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      showToast('Failed to update quantity', 'error')
      await fetchCart()
    }
  }

  const clearCart = async () => {
    if (!user) {
      storeClear()
      return
    }

    storeClear()

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      showToast('Failed to clear cart', 'error')
      await fetchCart()
    }
  }

  return { addItem, removeItem, updateQty, clearCart, fetchCart }
}

/** Cart mutations — DB + store. AppShell mounts useCartSync() for hydration. */
export function useCart() {
  return useCartActions()
}
