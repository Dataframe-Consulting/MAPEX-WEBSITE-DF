'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocalCartItem } from '@/types';
import { getDeliveryFee } from '@/lib/utils';

interface CartState {
  items: LocalCartItem[];
  isOpen: boolean;
  addItem: (item: LocalCartItem) => void;
  removeItem: (variant_id: string) => void;
  updateQuantity: (variant_id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(i => i.variant_id === newItem.variant_id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.variant_id === newItem.variant_id
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (variant_id) => {
        set((state) => ({
          items: state.items.filter(i => i.variant_id !== variant_id),
        }));
      },

      updateQuantity: (variant_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variant_id);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.variant_id === variant_id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getDeliveryFee: () => getDeliveryFee(get().getSubtotal()),
      getTotal: () => get().getSubtotal() + get().getDeliveryFee(),
    }),
    {
      name: 'mapex-cart',
    }
  )
);
