const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('verdura_admin_token')
}

export function setToken(t: string | null) {
  if (!t) localStorage.removeItem('verdura_admin_token')
  else localStorage.setItem('verdura_admin_token', t)
}

export function setRefreshToken(t: string | null) {
  if (!t) localStorage.removeItem('verdura_admin_refresh')
  else localStorage.setItem('verdura_admin_refresh', t)
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('verdura_admin_refresh')
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers as Record<string, string> || {}) },
  })
  if (res.status === 401) {
    const rt = getRefreshToken()
    if (rt) {
      const rr = await fetch(`${BASE}/api/v1/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) })
      if (rr.ok) {
        const d = await rr.json(); setToken(d.data.accessToken)
        const retry = await fetch(`${BASE}/api/v1${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${d.data.accessToken}`, ...(opts.headers as Record<string, string> || {}) } })
        if (!retry.ok) { const e = await retry.json().catch(() => ({})); throw new Error(e.error || 'Failed') }
        return retry.json()
      }
    }
    setToken(null); setRefreshToken(null)
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired')
  }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed') }
  return res.json()
}

const get = <T>(p: string) => req<T>(p)
const post = <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) })
const patch = <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(b) })
const del = <T>(p: string) => req<T>(p, { method: 'DELETE' })

export const adminApi = {
  login: (email: string, password: string) =>
    post<{ success: true; data: { user: AdminUser; tokens: { accessToken: string; refreshToken: string } } }>('/auth/login', { email, password }),

  me: () => get<{ success: true; data: AdminUser }>('/auth/me'),

  stats: () => get<{ success: true; data: Stats }>('/admin/stats'),

  plants: {
    list: () => get<{ success: true; data: Plant[] }>('/admin/plants'),
    create: (data: Partial<Plant>) => post<{ success: true; data: Plant }>('/admin/plants', data),
    update: (id: string, data: Partial<Plant>) => patch<{ success: true; data: Plant }>(`/admin/plants/${id}`, data),
    delete: (id: string) => del(`/admin/plants/${id}`),
  },

  supplies: {
    list: () => get<{ success: true; data: Supply[] }>('/admin/supplies'),
    create: (data: Partial<Supply>) => post<{ success: true; data: Supply }>('/admin/supplies', data),
    update: (id: string, data: Partial<Supply>) => patch<{ success: true; data: Supply }>(`/admin/supplies/${id}`, data),
    delete: (id: string) => del(`/admin/supplies/${id}`),
  },

  orders: {
    list: () => get<{ success: true; data: Order[] }>('/admin/orders'),
    updateStatus: (id: string, status: string, trackingNumber?: string) =>
      patch<{ success: true; data: Order }>(`/admin/orders/${id}/status`, { status, trackingNumber }),
  },

  users: {
    list: () => get<{ success: true; data: AdminUser[] }>('/admin/users'),
  },

  upload: (file: File) => {
    const form = new FormData(); form.append('file', file)
    const token = getToken()
    return fetch(`${BASE}/api/v1/admin/upload`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form })
      .then(r => r.json() as Promise<{ success: true; data: { url: string } }>)
  },
}

export interface AdminUser { id: string; name: string; email: string; role: string; createdAt: string; phone?: string }
export interface Stats { totalOrders: number; totalRevenue: number; totalUsers: number; totalPlants: number; monthOrders: number; monthRevenue: number }
export interface Plant {
  id: string; name: string; scientificName: string; slug: string; description: string
  price: number; comparePrice?: number; stock: number; thumbnailUrl: string; images: string[]
  categories: string[]; difficulty: string; tags: string[]; isBestseller: boolean; isNewArrival: boolean; isActive: boolean
  careWatering: string; careSunlight: string; careHumidity: string; careTemperature: string
  wateringIntervalDays: number; fertiliserIntervalDays: number; pruningIntervalDays?: number; repottingIntervalMonths?: number
  createdAt: string
}
export interface Supply { id: string; name: string; slug: string; description: string; price: number; comparePrice?: number; stock: number; thumbnailUrl: string; images: string[]; category: string; badges: string[]; isActive: boolean; createdAt: string }
export interface Order { id: string; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string; subtotal: number; shipping: number; total: number; trackingNumber?: string; createdAt: string; items: OrderItem[]; address: Address; user: { name: string; email: string } }
export interface OrderItem { id: string; name: string; price: number; quantity: number; thumbnailUrl: string }
export interface Address { id: string; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string }
