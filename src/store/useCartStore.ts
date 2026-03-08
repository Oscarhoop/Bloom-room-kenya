import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;          // product id
  slug: string;
  name: string;
  priceKes: number;
  quantity: number;
  imageUrl: string | null;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartState {
  items: CartItem[];

  // Drawer UI state
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  // Cart actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Derived getters
  totalItems: () => number;
  totalPrice: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Drawer UI — not persisted (see partialize below)
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === incoming.id);
          if (existing) {
            // Increase quantity if the same product is already in the cart
            return {
              items: state.items.map((i) =>
                i.id === incoming.id
                  ? { ...i, quantity: i.quantity + (incoming.quantity ?? 1) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...incoming, quantity: incoming.quantity ?? 1 }],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.priceKes * i.quantity, 0),
    }),
    {
      name: "bloom-cart",
      storage: createJSONStorage(() => localStorage),
      // Don't persist drawer open/close state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
