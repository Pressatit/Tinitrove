import { create } from 'zustand'
import type { Product } from '@/types'
import { persist } from 'zustand/middleware' 

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
  removeItem:  (productId: string,colorSelected:string | null) => void
  updateQty:   (productId: string, qty: number, colorSelected:string | null) => void
  clearCart:   () => void
}

const isSameItem = (
  item: CartItemWithProduct,
  productId: string,
  colorSelected?: string | null
) => {
  if (colorSelected === undefined) return item.product_id === productId
  return (
    item.product_id === productId &&
    (item.color_selected ?? null) === (colorSelected ?? null)
  )
}

export const useCartStore = create<CartState>() (
  persist (
    (set) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) =>
            isSameItem(i, item.product_id, item.color_selected)
          )
          if (existing) {
            const maxStock = item.product.stock_count ?? 99
            const nextQty = Math.min(existing.quantity + item.quantity, maxStock)
            return {
              items: s.items.map((i) =>
                isSameItem(i, item.product_id, item.color_selected)
                  ? { ...i, quantity: nextQty }
                  : i
              ),
            }
          }
          return { items: [...s.items, item] }
        }),

      removeItem: (productId, colorSelected) =>
        set((s) => ({
          items: s.items.filter((i) => !isSameItem(i, productId, colorSelected)),
        })),

      updateQty: (productId, qty, colorSelected) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => !isSameItem(i, productId, colorSelected))
              : s.items.map((i) =>
                  isSameItem(i, productId, colorSelected)
                    ? { ...i, quantity: qty }
                    : i
                ),
        })),

      clearCart: () => set({ items: [] }),

    }),
    {
      name:'tinitrove_cart_storage'
    }
  )
)

/** Selectors — subscribe to `items` so Zustand re-renders on changes */
export const selectCartItemCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartTotalPrice = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
