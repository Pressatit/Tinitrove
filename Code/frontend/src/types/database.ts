/**
 * Supabase type definitions.
 * Regenerate after schema changes:
 * npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; full_name: string | null; email: string
          phone: string | null; delivery_address: string | null
          tinipoints: number; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'tinipoints'|'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; cover_image_url: string | null }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      products: {
        Row: {
          id: string; category_id: string; name: string; description: string | null
          price: number; stock_count: number; image_urls: string[]; tags: string[]
          color_variants: string[]; is_active: boolean; is_hot_deal: boolean
          is_new_arrival: boolean; weight_kg: number | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id'|'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      orders: {
        Row: {
          id: string; user_id: string
          status: 'cart'|'in_transit'|'to_be_shipped'|'completed'
          total_amount: number; delivery_address: string
          mpesa_ref: string | null
          payment_status: 'pending'|'paid'|'failed'; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id'|'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      order_items: {
        Row: { id: string; order_id: string; product_id: string; quantity: number; unit_price: number; color_selected: string | null }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Row']>
      }
      cart_items: {
        Row: { id: string; user_id: string; product_id: string; quantity: number; color_selected: string | null; added_at: string }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id'|'added_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>
      }
      favorites: {
        Row: { id: string; user_id: string; product_id: string; saved_at: string }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id'|'saved_at'>
        Update: never
      }
    }
  }
}
