import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define the structural shape of a Single Cart Item
export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stockQuantity: number;
}

// 2. Define exactly what data and actions our Global Store holds
interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// 3. Create the Reactive Store with automatic LocalStorage synchronization
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Action: Add an item or increment quantity if it already exists
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Prevent adding more than available warehouse stock
          if (existingItem.quantity >= product.stockQuantity) return;

          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // New item being added to cart for the first time
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      // Action: Remove an item entirely from the cart
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      // Action: Update quantity directly (e.g., input field or +/- buttons)
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Action: Wipe the cart completely (used after a successful checkout)
      clearCart: () => set({ items: [] }),

      // Utility: Calculate total count of items for Navbar badges
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Utility: Calculate total cost for the checkout button
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'tinitrove-cart', // Unique key used inside the browser's localStorage engine
    }
  )
);
