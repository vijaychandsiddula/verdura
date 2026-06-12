import { http } from './http'
import type {
  Plant, Supply, Order, Cart, CartItem, GardenPlant, Reminder,
  User, AuthTokens, LoginPayload, RegisterPayload,
  PlantFilters, SupplyFilters, Address,
  ApiResponse, PaginatedResponse, NotificationPayload, PushToken,
} from '@verdura/types'

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    http.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    http.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', payload),

  refresh: () =>
    http.post<ApiResponse<AuthTokens>>('/auth/refresh'),

  logout: () =>
    http.post('/auth/logout'),

  me: () =>
    http.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl'>>) =>
    http.patch<ApiResponse<User>>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    http.post('/auth/change-password', data),
}

// ─── PLANTS ──────────────────────────────────────────────────────────────────

export const plantsApi = {
  list: (filters?: PlantFilters) =>
    http.get<PaginatedResponse<Plant>>('/plants', { params: filters }),

  getBySlug: (slug: string) =>
    http.get<ApiResponse<Plant>>(`/plants/${slug}`),

  getById: (id: string) =>
    http.get<ApiResponse<Plant>>(`/plants/id/${id}`),

  getFeatured: () =>
    http.get<ApiResponse<Plant[]>>('/plants/featured'),

  getBestsellers: () =>
    http.get<ApiResponse<Plant[]>>('/plants/bestsellers'),

  getRelated: (id: string) =>
    http.get<ApiResponse<Plant[]>>(`/plants/${id}/related`),

  // Admin only
  create: (data: Partial<Plant>) =>
    http.post<ApiResponse<Plant>>('/admin/plants', data),

  update: (id: string, data: Partial<Plant>) =>
    http.patch<ApiResponse<Plant>>(`/admin/plants/${id}`, data),

  delete: (id: string) =>
    http.delete(`/admin/plants/${id}`),
}

// ─── SUPPLIES ────────────────────────────────────────────────────────────────

export const suppliesApi = {
  list: (filters?: SupplyFilters) =>
    http.get<PaginatedResponse<Supply>>('/supplies', { params: filters }),

  getBySlug: (slug: string) =>
    http.get<ApiResponse<Supply>>(`/supplies/${slug}`),

  getByCategory: (category: string) =>
    http.get<ApiResponse<Supply[]>>(`/supplies/category/${category}`),
}

// ─── CART ────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () =>
    http.get<ApiResponse<Cart>>('/cart'),

  addItem: (item: Omit<CartItem, 'id'>) =>
    http.post<ApiResponse<Cart>>('/cart/items', item),

  updateItem: (itemId: string, quantity: number) =>
    http.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    http.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),

  clear: () =>
    http.delete<ApiResponse<Cart>>('/cart'),
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: (page = 1) =>
    http.get<PaginatedResponse<Order>>('/orders', { params: { page } }),

  getById: (id: string) =>
    http.get<ApiResponse<Order>>(`/orders/${id}`),

  create: (data: { addressId: string; paymentMethod: string; notes?: string }) =>
    http.post<ApiResponse<{ order: Order; razorpayOrderId?: string }>>('/orders', data),

  verifyPayment: (data: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }) => http.post<ApiResponse<Order>>('/orders/verify-payment', data),

  cancel: (id: string) =>
    http.post<ApiResponse<Order>>(`/orders/${id}/cancel`),
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export const addressesApi = {
  list: () =>
    http.get<ApiResponse<Address[]>>('/addresses'),

  create: (data: Omit<Address, 'id'>) =>
    http.post<ApiResponse<Address>>('/addresses', data),

  update: (id: string, data: Partial<Address>) =>
    http.patch<ApiResponse<Address>>(`/addresses/${id}`, data),

  delete: (id: string) =>
    http.delete(`/addresses/${id}`),

  setDefault: (id: string) =>
    http.post(`/addresses/${id}/default`),
}

// ─── MY GARDEN ───────────────────────────────────────────────────────────────

export const gardenApi = {
  list: () =>
    http.get<ApiResponse<GardenPlant[]>>('/garden'),

  add: (plantId: string, nickname?: string) =>
    http.post<ApiResponse<GardenPlant>>('/garden', { plantId, nickname }),

  remove: (id: string) =>
    http.delete(`/garden/${id}`),

  updateHealth: (id: string, healthScore: number) =>
    http.patch<ApiResponse<GardenPlant>>(`/garden/${id}`, { healthScore }),
}

// ─── REMINDERS ───────────────────────────────────────────────────────────────

export const remindersApi = {
  list: (status?: string) =>
    http.get<ApiResponse<Reminder[]>>('/reminders', { params: { status } }),

  getToday: () =>
    http.get<ApiResponse<Reminder[]>>('/reminders/today'),

  markDone: (id: string) =>
    http.post<ApiResponse<Reminder>>(`/reminders/${id}/done`),

  snooze: (id: string, until: string) =>
    http.post<ApiResponse<Reminder>>(`/reminders/${id}/snooze`, { until }),

  skip: (id: string) =>
    http.post<ApiResponse<Reminder>>(`/reminders/${id}/skip`),
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const notificationsApi = {
  registerToken: (data: Omit<PushToken, 'id' | 'userId' | 'createdAt'>) =>
    http.post<ApiResponse<PushToken>>('/notifications/token', data),

  send: (payload: NotificationPayload & { userIds: string[] }) =>
    http.post('/admin/notifications/send', payload),
}
