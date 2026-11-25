import { useEffect, useCallback ,useRef} from 'react'
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

async function mergeGuestItemsToDb(
  userId: string,
  guestItems: CartItemWithProduct[]
): Promise<void> {
  if (guestItems.length === 0) return

  const { data: existingRows, error: fetchError } = await supabase
    .from('cart')
    .select('product_id, quantity, color_selected, products(stock_count)')
    .eq('user_id', userId)

  if (fetchError) {
    console.error('Failed to fetch DB cart for merge:', fetchError.message)
    return
  }

  const makeKey = (productId: string, color: string | null) =>
    `${productId}::${color ?? 'NONE'}`

  const existingMap = new Map(
    (existingRows || []).map((row) => [
      makeKey(row.product_id, row.color_selected),
      row,
    ])
  )

  const upsertPayload = guestItems.map((guestItem) => {
    const normalizedColor = guestItem.color_selected ?? null
    const existing = existingMap.get(
      makeKey(guestItem.product_id, normalizedColor)
    )
    const dbStock = (existing?.products as { stock_count?: number } | null)
      ?.stock_count
    const maxStock = dbStock ?? guestItem.product.stock_count ?? 99
    const combinedQty = (existing?.quantity || 0) + guestItem.quantity

    return {
      user_id:        userId,
      product_id:     guestItem.product_id,
      color_selected: normalizedColor,
      quantity:       Math.min(combinedQty, maxStock),
    }
  })

  const { error: upsertError } = await supabase
    .from('cart')
    .upsert(upsertPayload, {
      onConflict: 'user_id,product_id,color_selected',
    })

  if (upsertError) {
    console.error('Failed to merge guest cart:', upsertError.message)
  }
}


// ── Bootstrap: hydrate from DB + realtime sync (mount once in AppShell) ──
export function useCartSync() {
  const user        = useAuthStore(s => s.user)
  const authLoading = useAuthStore(s => s.loading)
  const setItems    = useCartStore(s => s.setItems)
  const clearCart   = useCartStore(s => s.clearCart)
  const prevUserId  = useRef<string | null>(null)

  const fetchCart = useCallback(async () => {
    if (!user) return
    const items = await loadCartFromDb(user.id)
    setItems(items)
  }, [user, setItems])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      if (prevUserId.current !== null) {
        clearCart()
        prevUserId.current = null
      }
      return
    }

    prevUserId.current = user.id

    const syncAndMerge = async () => {
      const currentItems = useCartStore.getState().items
      const guestItems = currentItems.filter((i) => i.user_id === 'guest')

      if (guestItems.length > 0) {
        await mergeGuestItemsToDb(user.id, guestItems)
      }

      await fetchCart()
    }

    void syncAndMerge()


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
  const storeAdd    =useCartStore(s => s.addItem)
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
      const existing = useCartStore
        .getState()
        .items.find(
          (i) =>
            i.product_id === product.id &&
            (i.color_selected ?? null) === (colorSelected ?? null)
        )

      if (existing && existing.quantity >= product.stock_count) {
        showToast(`Only ${product.stock_count} available in stock`, 'info')
        return
      }

      storeAdd({
        id:             `guest-${product.id}-${colorSelected ?? 'default'}`,
        user_id:        'guest',
        product_id:     product.id,
        quantity:       1,
        color_selected: colorSelected,
        added_at:       new Date().toISOString(),
        product,
      })
      showToast(`${product.name} added to cart`, 'success')
      return
    }

    let lookupQuery = supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)

    lookupQuery = colorSelected
      ? lookupQuery.eq('color_selected', colorSelected)
      : lookupQuery.is('color_selected', null)

    const { data: existing, error: lookupError } = await lookupQuery.maybeSingle()

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

  const removeItem = async (productId: string, colorSelected: string | null, productName?: string, ) => {
    

    storeRemove(productId,colorSelected)

    if (!user) {
      if (productName) showToast(`${productName} removed`, 'info')
      return
    }
    
   let deleteQuery = supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (colorSelected !== undefined) {
      deleteQuery = colorSelected
        ? deleteQuery.eq('color_selected', colorSelected)
        : deleteQuery.is('color_selected', null)
    }

    const { error } = await deleteQuery

    if (error) {
      showToast('Failed to remove item', 'error')
      await fetchCart()
      return
    }

    if (productName) showToast(`${productName} removed`, 'info')
  }

  const updateQty = async (productId: string, qty: number,colorSelected : string |null ) => {
    
    if (qty <= 0) {
      await removeItem(productId,colorSelected)
      return
    }

    storeUpdate(productId, qty,colorSelected)

    if (!user) return

    let updateQuery = supabase
      .from('cart')
      .update({ quantity: qty })
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (colorSelected !== undefined) {
      updateQuery = colorSelected
        ? updateQuery.eq('color_selected', colorSelected)
        : updateQuery.is('color_selected', null)
    }

    const { error } = await updateQuery

    if (error) {
      showToast('Failed to update quantity', 'error')
      await fetchCart()
    }
  }

  const clearCart = async () => {

    storeClear()

    if (!user) return

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
