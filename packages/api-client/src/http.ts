import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

let _accessToken: string | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export const http: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token on every request
http.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// Auto-refresh on 401
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        setAccessToken(data.data.accessToken)
        if (original.headers) {
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
        }
        return http(original)
      } catch {
        setAccessToken(null)
        window?.location?.replace?.('/login')
      }
    }
    return Promise.reject(error)
  }
)
