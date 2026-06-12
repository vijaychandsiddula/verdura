import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import {
  plantsApi, suppliesApi, cartApi, ordersApi,
  gardenApi, remindersApi, authApi, addressesApi,
} from './api'
import type { PlantFilters, SupplyFilters } from '@verdura/types'

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────

export const queryKeys = {
  plants:      (filters?: PlantFilters) => ['plants', filters] as const,
  plant:       (slug: string)           => ['plant', slug] as const,
  supplies:    (filters?: SupplyFilters)=> ['supplies', filters] as const,
  supply:      (slug: string)           => ['supply', slug] as const,
  cart:                                    ['cart'] as const,
  orders:      (page: number)           => ['orders', page] as const,
  order:       (id: string)             => ['order', id] as const,
  garden:                                  ['garden'] as const,
  reminders:   (status?: string)        => ['reminders', status] as const,
  remindersToday:                          ['reminders', 'today'] as const,
  addresses:                               ['addresses'] as const,
  me:                                      ['me'] as const,
}

// ─── PLANTS ──────────────────────────────────────────────────────────────────

export function usePlants(filters?: PlantFilters) {
  return useQuery({
    queryKey: queryKeys.plants(filters),
    queryFn: () => plantsApi.list(filters).then((r) => r.data),
  })
}

export function usePlant(slug: string) {
  return useQuery({
    queryKey: queryKeys.plant(slug),
    queryFn: () => plantsApi.getBySlug(slug).then((r) => r.data),
    enabled: !!slug,
  })
}

export function useFeaturedPlants() {
  return useQuery({
    queryKey: ['plants', 'featured'],
    queryFn: () => plantsApi.getFeatured().then((r) => r.data),
  })
}

// ─── SUPPLIES ────────────────────────────────────────────────────────────────

export function useSupplies(filters?: SupplyFilters) {
  return useQuery({
    queryKey: queryKeys.supplies(filters),
    queryFn: () => suppliesApi.list(filters).then((r) => r.data),
  })
}

export function useSupply(slug: string) {
  return useQuery({
    queryKey: queryKeys.supply(slug),
    queryFn: () => suppliesApi.getBySlug(slug).then((r) => r.data),
    enabled: !!slug,
  })
}

// ─── CART ────────────────────────────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => cartApi.get().then((r) => r.data),
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export function useOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.orders(page),
    queryFn: () => ordersApi.list(page).then((r) => r.data),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => ordersApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart })
      qc.invalidateQueries({ queryKey: queryKeys.orders(1) })
    },
  })
}

// ─── GARDEN ──────────────────────────────────────────────────────────────────

export function useGarden() {
  return useQuery({
    queryKey: queryKeys.garden,
    queryFn: () => gardenApi.list().then((r) => r.data),
  })
}

export function useAddToGarden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ plantId, nickname }: { plantId: string; nickname?: string }) =>
      gardenApi.add(plantId, nickname),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.garden }),
  })
}

// ─── REMINDERS ───────────────────────────────────────────────────────────────

export function useReminders(status?: string) {
  return useQuery({
    queryKey: queryKeys.reminders(status),
    queryFn: () => remindersApi.list(status).then((r) => r.data),
  })
}

export function useTodayReminders() {
  return useQuery({
    queryKey: queryKeys.remindersToday,
    queryFn: () => remindersApi.getToday().then((r) => r.data),
    refetchInterval: 60_000, // refresh every minute
  })
}

export function useMarkReminderDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: remindersApi.markDone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.remindersToday })
      qc.invalidateQueries({ queryKey: queryKeys.reminders() })
    },
  })
}

export function useSnoozeReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      remindersApi.snooze(id, until),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.remindersToday }),
  })
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => addressesApi.list().then((r) => r.data),
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addressesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  })
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authApi.me().then((r) => r.data),
    retry: false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => qc.clear(),
  })
}
