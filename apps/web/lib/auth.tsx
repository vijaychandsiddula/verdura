'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, setToken, setRefreshToken, getRefreshToken, type User } from './api'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('verdura_token') : null
    if (!token) { setLoading(false); return }
    authApi.me()
      .then((res) => setUser(res.data))
      .catch(() => { setToken(null); setRefreshToken(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.data.tokens.accessToken)
    setRefreshToken(res.data.tokens.refreshToken)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const res = await authApi.register(name, email, password, phone)
    setToken(res.data.tokens.accessToken)
    setRefreshToken(res.data.tokens.refreshToken)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    const rt = getRefreshToken()
    if (rt) await authApi.logout(rt).catch(() => {})
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
