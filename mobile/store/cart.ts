import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CartItem {
  id: string
  name: string
  price: number
  emoji: string
  qty: number
}

interface CartStore {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => set((s) => {
        const ex = s.items.find((i) => i.id === item.id)
        if (ex) return { items: s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) }
        return { items: [...s.items, { ...item, qty: 1 }] }
      }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) => {
        if (qty <= 0) { get().remove(id); return }
        set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, qty } : i) }))
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    {
      name: 'verdura-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
