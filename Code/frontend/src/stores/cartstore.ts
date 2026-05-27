import { create } from 'zustand'
import type { Product } from '@/types'

export interface CartItemWithProduct {
  id:             string
  user_id:        string
  product_id:     string
  quantity:       number
  color_selected: string | null
  added_at:       string
  product:        Product
}

interface CartState {
  items:       CartItemWithProduct[]
  setItems:    (items: CartItemWithProduct[]) => void
  addItem:     (item: CartItemWithProduct) => void
  removeItem:  (productId: string) => void
  updateQty:   (productId: string, qty: number) => void
  clearCart:   () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  setItems: (items) => set({ items }),

  addItem: (item) => set((s) => {
    const existing = s.items.find(i => i.product_id === item.product_id)
    if (existing) {
      return {
        items: s.items.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      }
    }
    return { items: [...s.items, item] }
  }),

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter(i => i.product_id !== productId) })),

  updateQty: (productId, qty) =>
    set((s) => ({
      items: qty <= 0
        ? s.items.filter(i => i.product_id !== productId)
        : s.items.map(i =>
            i.product_id === productId ? { ...i, quantity: qty } : i
          ),
    })),

  clearCart: () => set({ items: [] }),
}))

/** Selectors — subscribe to `items` so Zustand re-renders on changes */
export const selectCartItemCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartTotalPrice = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
