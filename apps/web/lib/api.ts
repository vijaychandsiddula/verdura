const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('verdura_token')
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('verdura_token', token)
  else localStorage.removeItem('verdura_token')
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('verdura_refresh', token)
  else localStorage.removeItem('verdura_refresh')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('verdura_refresh')
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers as Record<string, string> || {}),
    },
  })

  if (res.status === 401) {
    // Try to refresh token
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setToken(data.data.accessToken)
        // Retry original request with new token
        const retryRes = await fetch(`${BASE}/api/v1${path}`, {
          ...opts,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.data.accessToken}`,
            ...(opts.headers as Record<string, string> || {}),
          },
        })
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(err.error || 'Request failed')
        }
        return retryRes.json()
      } else {
        setToken(null)
        setRefreshToken(null)
        window.location.href = '/login'
        throw new Error('Session expired')
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const patch = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' })

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    post<{ success: true; data: { user: User; tokens: { accessToken: string; refreshToken: string } } }>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone?: string) =>
    post<{ success: true; data: { user: User; tokens: { accessToken: string; refreshToken: string } } }>('/auth/register', { name, email, password, phone }),

  me: () => get<{ success: true; data: User }>('/auth/me'),

  logout: (refreshToken: string) => post('/auth/logout', { refreshToken }),

  updateProfile: (data: Partial<Pick<User, 'name' | 'phone'>>) => patch<{ success: true; data: User }>('/auth/me', data),
}

// ─── PLANTS ──────────────────────────────────────────────────────────────────

export const plantsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: Plant[]; pagination: Pagination }>(`/plants${qs}`)
  },
  getBySlug: (slug: string) => get<{ success: true; data: Plant }>(`/plants/${slug}`),
  getFeatured: () => get<{ success: true; data: Plant[] }>('/plants/featured'),
  getRelated: (slug: string) => get<{ success: true; data: Plant[] }>(`/plants/${slug}/related`),
}

// ─── SUPPLIES ────────────────────────────────────────────────────────────────

export const suppliesApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: Supply[]; pagination: Pagination }>(`/supplies${qs}`)
  },
  getBySlug: (slug: string) => get<{ success: true; data: Supply }>(`/supplies/${slug}`),
}

export const seedsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: Seed[]; pagination: Pagination }>(`/seeds${qs}`)
  },
  getBySlug: (slug: string) => get<{ success: true; data: Seed }>(`/seeds/${slug}`),
}

// ─── CART ────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => get<{ success: true; data: ApiCart }>('/cart'),
  addItem: (productId: string, productType: 'plant' | 'supply' | 'seed', quantity = 1) =>
    post<{ success: true; data: ApiCart }>('/cart/items', { productId, productType, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    patch<{ success: true; data: ApiCart }>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => del<{ success: true; data: ApiCart }>(`/cart/items/${itemId}`),
  clear: () => del<{ success: true; data: ApiCart }>('/cart'),
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: (page = 1) => get<{ success: true; data: Order[]; pagination: Pagination }>(`/orders?page=${page}`),
  getById: (id: string) => get<{ success: true; data: Order }>(`/orders/${id}`),
  create: (addressId: string, paymentMethod: string, notes?: string) =>
    post<{ success: true; data: { order: Order; razorpayOrderId?: string } }>('/orders', { addressId, paymentMethod, notes }),
  verifyPayment: (data: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    post<{ success: true; data: Order }>('/orders/verify-payment', data),
  cancel: (id: string) => post<{ success: true; data: Order }>(`/orders/${id}/cancel`),
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export const addressesApi = {
  list: () => get<{ success: true; data: Address[] }>('/addresses'),
  create: (data: Omit<Address, 'id' | 'isDefault'>) => post<{ success: true; data: Address }>('/addresses', data),
  update: (id: string, data: Partial<Address>) => patch<{ success: true; data: Address }>(`/addresses/${id}`, data),
  delete: (id: string) => del(`/addresses/${id}`),
  setDefault: (id: string) => post<{ success: true; data: Address }>(`/addresses/${id}/default`),
}

// ─── GARDEN ──────────────────────────────────────────────────────────────────

export const gardenApi = {
  list: () => get<{ success: true; data: GardenPlant[] }>('/garden'),
  add: (plantId: string, nickname?: string) => post<{ success: true; data: GardenPlant }>('/garden', { plantId, nickname }),
  remove: (id: string) => del(`/garden/${id}`),
}

// ─── REMINDERS ───────────────────────────────────────────────────────────────

export const remindersApi = {
  list: (status?: string) => get<{ success: true; data: Reminder[] }>(`/reminders${status ? `?status=${status}` : ''}`),
  getToday: () => get<{ success: true; data: Reminder[] }>('/reminders/today'),
  markDone: (id: string) => post<{ success: true; data: Reminder }>(`/reminders/${id}/done`),
  snooze: (id: string, until: string) => post<{ success: true; data: Reminder }>(`/reminders/${id}/snooze`, { until }),
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatarUrl?: string
  role: 'customer' | 'admin'
  createdAt: string
}

export interface Plant {
  id: string
  name: string
  scientificName: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  thumbnailUrl: string
  categories: string[]
  difficulty: 'beginner' | 'intermediate' | 'expert'
  tags: string[]
  isBestseller: boolean
  isNewArrival: boolean
  isActive: boolean
  careWatering: string
  careSunlight: string
  careHumidity: string
  careTemperature: string
  wateringIntervalDays: number
  fertiliserIntervalDays: number
  pruningIntervalDays?: number
  repottingIntervalMonths?: number
  potSizeMinInch?: number; potSizeMaxInch?: number; potVolumeLitres?: number
  soilCocoPeatPct?: number; soilGardenSoilPct?: number; soilCompostPct?: number
  soilExtrasPct?: number; soilExtrasNote?: string; potNotes?: string
  kit?: KitItem[]
  kitTotal?: number
  careGuide: CareGuideSection[]
  partner?: { id: string; businessName: string; city: string; state: string }
  createdAt: string
  updatedAt: string
}

export interface KitItem {
  slug: string
  name: string
  role: string
  qty: number
  unit: string
  exactNote: string
  priority: 'essential' | 'recommended' | 'optional'
  price: number
  thumbnailUrl?: string
}

export interface CareGuideSection {
  id: string
  title: string
  icon: string
  body: string
  order: number
}

export interface Supply {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  thumbnailUrl: string
  category: string
  badges: string[]
  isActive: boolean
  createdAt: string
}

export interface Seed {
  id: string
  name: string
  scientificName: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  thumbnailUrl: string
  categories: string[]
  difficulty: string
  tags: string[]
  isBestseller: boolean
  isNewArrival: boolean
  isActive: boolean
  germinationDays: string
  sowingDepth: string
  sowingMethod: string
  harvestDays?: string
  seedsPerPacket: number
  sowingSeason: string
  linkedPlantSlug?: string
  createdAt: string
}

export interface ApiCart {
  items: ApiCartItem[]
  subtotal: number
  shipping: number
  total: number
  itemCount: number
}

export interface ApiCartItem {
  id: string
  quantity: number
  plant?: Plant
  supply?: Supply
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shipping: number
  total: number
  razorpayOrderId?: string
  razorpayPaymentId?: string
  trackingNumber?: string
  notes?: string
  items: OrderItem[]
  address: Address
  createdAt: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  thumbnailUrl: string
}

export interface Address {
  id: string
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface GardenPlant {
  id: string
  plantId: string
  plant: Plant
  nickname?: string
  healthScore: number
  notes?: string
  acquiredAt: string
  reminders?: Reminder[]
}

export interface Reminder {
  id: string
  gardenPlantId: string
  gardenPlant: GardenPlant
  type: 'watering' | 'fertilising' | 'pruning' | 'repotting' | 'seasonal'
  title: string
  body: string
  dueAt: string
  status: 'pending' | 'done' | 'snoozed' | 'skipped'
  snoozedUntil?: string
  completedAt?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
