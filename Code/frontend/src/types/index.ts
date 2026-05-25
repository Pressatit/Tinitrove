import type { Database } from '@/types/supabase'

export type Profile   = Database['public']['Tables']['profiles']['Row']
export type Category  = Database['public']['Tables']['categories']['Row']
export type Product   = Database['public']['Tables']['products']['Row']
export type Order     = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type CartItem  = Database['public']['Tables']['cart']['Row']
export type Favorite  = Database['public']['Tables']['favorites']['Row']

export interface CartItemWithProduct extends CartItem {
  product: Product
}
