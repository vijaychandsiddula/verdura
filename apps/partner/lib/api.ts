const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('verdura_partner_token')
}
export function setToken(t: string | null) {
  if (!t) localStorage.removeItem('verdura_partner_token')
  else localStorage.setItem('verdura_partner_token', t)
}
export function setRefreshToken(t: string | null) {
  if (!t) localStorage.removeItem('verdura_partner_refresh')
  else localStorage.setItem('verdura_partner_refresh', t)
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API}/api/v1/partners${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers as Record<string, string> || {}),
    },
  })
  if (res.status === 401) {
    setToken(null); setRefreshToken(null)
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired')
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

const get = <T>(p: string) => req<T>(p)
const post = <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) })
const patch = <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(b) })
const del = <T>(p: string) => req<T>(p, { method: 'DELETE' })

export const partnerApi = {
  register: (data: RegisterData) => post<AuthResponse>('/register', data),
  login: (email: string, password: string) => post<AuthResponse>('/login', { email, password }),
  me: () => get<{ success: true; data: Partner }>('/me'),
  updateMe: (data: Partial<Partner>) => patch<{ success: true; data: Partner }>('/me', data),
  dashboard: () => get<{ success: true; data: Dashboard }>('/me/dashboard'),
  orders: (page = 1) => get<{ success: true; data: PartnerOrderItem[]; pagination: Pagination }>(`/me/orders?page=${page}`),

  plants: {
    list: () => get<{ success: true; data: any[] }>('/me/plants'),
    create: (data: any) => post<{ success: true; data: any }>('/me/plants', data),
    update: (id: string, data: any) => patch<{ success: true; data: any }>(`/me/plants/${id}`, data),
    remove: (id: string) => del(`/me/plants/${id}`),
  },
  seeds: {
    list: () => get<{ success: true; data: any[] }>('/me/seeds'),
    create: (data: any) => post<{ success: true; data: any }>('/me/seeds', data),
    update: (id: string, data: any) => patch<{ success: true; data: any }>(`/me/seeds/${id}`, data),
    remove: (id: string) => del(`/me/seeds/${id}`),
  },
  supplies: {
    list: () => get<{ success: true; data: any[] }>('/me/supplies'),
    create: (data: any) => post<{ success: true; data: any }>('/me/supplies', data),
    update: (id: string, data: any) => patch<{ success: true; data: any }>(`/me/supplies/${id}`, data),
    remove: (id: string) => del(`/me/supplies/${id}`),
  },
}

export interface RegisterData {
  email: string; password: string; businessName: string; ownerName: string
  phone: string; type: string; city: string; state: string; pincode: string
  description?: string; gstNumber?: string
}
export interface Partner {
  id: string; email: string; businessName: string; ownerName: string
  phone: string; type: string; status: string; city: string; state: string
  pincode: string; gstNumber?: string; description?: string; logoUrl?: string
  commissionPct: number; totalEarnings: number; pendingPayout: number
}
export interface AuthResponse {
  success: true
  data: { partner: Partner; tokens: { accessToken: string; refreshToken: string } }
}
export interface Dashboard {
  listings: { plants: number; seeds: number; supplies: number }
  recentOrders: PartnerOrderItem[]
  earnings: { pendingPayout: number; totalEarnings: number }
}
export interface PartnerOrderItem {
  id: string; name: string; price: number; quantity: number; thumbnailUrl: string
  commissionPct: number; partnerEarning: number; verduraEarning: number
  order: { orderNumber: string; status: string; createdAt: string; user: { name: string }; address: { city: string; state: string } }
}
export interface Pagination { page: number; limit: number; total: number; totalPages: number }
