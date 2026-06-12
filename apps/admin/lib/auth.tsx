'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { adminApi, setToken, setRefreshToken, getRefreshToken, type AdminUser } from './api'

interface AuthState {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('verdura_admin_token') : null
    if (!token) { setLoading(false); return }
    adminApi.me()
      .then(res => { if (res.data.role !== 'admin') { setToken(null); setRefreshToken(null) } else setUser(res.data) })
      .catch(() => { setToken(null); setRefreshToken(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.login(email, password)
    if (res.data.user.role !== 'admin') throw new Error('Admin access required')
    setToken(res.data.tokens.accessToken)
    setRefreshToken(res.data.tokens.refreshToken)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(() => {
    setToken(null); setRefreshToken(null); setUser(null)
    window.location.href = '/login'
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
