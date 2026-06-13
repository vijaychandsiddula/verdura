import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('verdura_token')
}

export async function setToken(t: string | null) {
  if (t) await AsyncStorage.setItem('verdura_token', t)
  else await AsyncStorage.removeItem('verdura_token')
}

export async function setRefreshToken(t: string | null) {
  if (t) await AsyncStorage.setItem('verdura_refresh', t)
  else await AsyncStorage.removeItem('verdura_refresh')
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem('verdura_refresh')
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers as Record<string, string> || {}),
    },
  })

  if (res.status === 401) {
    const rt = await getRefreshToken()
    if (rt) {
      const rr = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
      if (rr.ok) {
        const d = await rr.json(); await setToken(d.data.accessToken)
        const retry = await fetch(`${BASE}/api/v1${path}`, {
          ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${d.data.accessToken}`, ...(opts.headers as Record<string, string> || {}) },
        })
        if (!retry.ok) { const e = await retry.json().catch(() => ({})); throw new Error(e.error || 'Failed') }
        return retry.json()
      }
    }
    await setToken(null); await setRefreshToken(null)
    throw new Error('SESSION_EXPIRED')
  }

  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed') }
  return res.json()
}

const get = <T>(p: string) => req<T>(p)
const post = <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) })
const del = <T>(p: string) => req<T>(p, { method: 'DELETE' })

export const authApi = {
  login: (email: string, password: string) =>
    post<{ success: true; data: { user: ApiUser; tokens: { accessToken: string; refreshToken: string } } }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) =>
    post<{ success: true; data: { user: ApiUser; tokens: { accessToken: string; refreshToken: string } } }>('/auth/register', { name, email, password, phone }),
  me: () => get<{ success: true; data: ApiUser }>('/auth/me'),
  logout: (refreshToken: string) => post('/auth/logout', { refreshToken }),
}

export const plantsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: ApiPlant[]; pagination: { total: number; totalPages: number; page: number } }>(`/plants${qs}`)
  },
  getById: (id: string) => get<{ success: true; data: ApiPlant }>(`/plants/id/${id}`),
  getFeatured: () => get<{ success: true; data: ApiPlant[] }>('/plants/featured'),
}

export const suppliesApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: ApiSupply[]; pagination: { total: number } }>(`/supplies${qs}`)
  },
}

export const seedsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
    return get<{ success: true; data: ApiSeed[]; pagination: { total: number; totalPages: number } }>(`/seeds${qs}`)
  },
}

export const cartApi = {
  get: () => get<{ success: true; data: ApiCart }>('/cart'),
  addItem: (productId: string, productType: 'plant' | 'supply' | 'seed', quantity = 1) =>
    post<{ success: true; data: ApiCart }>('/cart/items', { productId, productType, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    req<{ success: true; data: ApiCart }>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: string) => del<{ success: true; data: ApiCart }>(`/cart/items/${itemId}`),
  clear: () => del<{ success: true; data: ApiCart }>('/cart'),
}

export const gardenApi = {
  list: () => get<{ success: true; data: ApiGardenPlant[] }>('/garden'),
  add: (plantId: string, nickname?: string) => post<{ success: true; data: ApiGardenPlant }>('/garden', { plantId, nickname }),
  remove: (id: string) => del(`/garden/${id}`),
}

export const remindersApi = {
  list: (status?: string) => get<{ success: true; data: ApiReminder[] }>(`/reminders${status ? '?status=' + status : ''}`),
  getToday: () => get<{ success: true; data: ApiReminder[] }>('/reminders/today'),
  markDone: (id: string) => post<{ success: true; data: ApiReminder }>(`/reminders/${id}/done`),
  snooze: (id: string, until: string) => post<{ success: true; data: ApiReminder }>(`/reminders/${id}/snooze`, { until }),
}

export interface ApiUser { id: string; name: string; email: string; phone?: string; role: string }
export interface ApiPlant {
  id: string; name: string; scientificName: string; slug: string; description: string
  price: number; comparePrice?: number; stock: number; thumbnailUrl: string; images: string[]
  categories: string[]; difficulty: string; tags: string[]; isBestseller: boolean; isNewArrival: boolean
  careWatering: string; careSunlight: string; careHumidity: string; careTemperature: string
  wateringIntervalDays: number; fertiliserIntervalDays: number
  pruningIntervalDays?: number; repottingIntervalMonths?: number
  potSizeMinInch?: number; potSizeMaxInch?: number; potVolumeLitres?: number
  soilCocoPeatPct?: number; soilGardenSoilPct?: number; soilCompostPct?: number
  soilExtrasPct?: number; soilExtrasNote?: string; potNotes?: string
  kit?: KitItem[]; kitTotal?: number
  careGuide: { id: string; title: string; icon: string; body: string; order: number }[]
}
export interface KitItem {
  slug: string; name: string; role: string; qty: number; unit: string
  exactNote: string; priority: 'essential' | 'recommended' | 'optional'
  price: number; thumbnailUrl?: string
}
export interface ApiSupply { id: string; name: string; slug: string; description: string; price: number; comparePrice?: number; stock: number; thumbnailUrl: string; category: string; badges: string[] }
export interface ApiSeed {
  id: string; name: string; scientificName: string; slug: string; description: string
  price: number; comparePrice?: number; stock: number; thumbnailUrl: string; images: string[]
  categories: string[]; difficulty: string; tags: string[]; isBestseller: boolean; isNewArrival: boolean
  germinationDays: string; sowingDepth: string; sowingMethod: string
  harvestDays?: string; seedsPerPacket: number; sowingSeason: string; linkedPlantSlug?: string
}
export interface ApiCart { items: ApiCartItem[]; subtotal: number; shipping: number; total: number; itemCount: number }
export interface ApiCartItem { id: string; quantity: number; plant?: ApiPlant; supply?: ApiSupply }
export interface ApiGardenPlant { id: string; plantId: string; plant: ApiPlant; nickname?: string; healthScore: number; acquiredAt: string }
export interface ApiReminder { id: string; gardenPlantId: string; gardenPlant: ApiGardenPlant; type: string; title: string; body: string; dueAt: string; status: string }
