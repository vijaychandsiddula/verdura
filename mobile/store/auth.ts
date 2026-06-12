import { create } from 'zustand'
import { authApi, setToken, setRefreshToken, getRefreshToken, type ApiUser } from '../lib/api'

interface AuthState {
  user: ApiUser | null
  loading: boolean
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const res = await authApi.me()
      set({ user: res.data })
    } catch {
      await setToken(null)
      await setRefreshToken(null)
    } finally {
      set({ hydrated: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await authApi.login(email, password)
      await setToken(res.data.tokens.accessToken)
      await setRefreshToken(res.data.tokens.refreshToken)
      set({ user: res.data.user })
    } finally {
      set({ loading: false })
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true })
    try {
      const res = await authApi.register(name, email, password, phone)
      await setToken(res.data.tokens.accessToken)
      await setRefreshToken(res.data.tokens.refreshToken)
      set({ user: res.data.user })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      const rt = await getRefreshToken()
      if (rt) await authApi.logout(rt)
    } catch {}
    await setToken(null)
    await setRefreshToken(null)
    set({ user: null })
  },
}))
