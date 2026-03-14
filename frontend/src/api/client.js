import axios from 'axios'

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthStorage } from '../context/authStorage'

// Prefer VITE_API_BASE_URL, but accept VITE_API_URL as a fallback to reduce deployment misconfig.
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const API_BASE_URL = apiBaseUrl
export const API_BASE_URL_LOOKS_LOCAL = /(^|\/\/)(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiBaseUrl)

if (import.meta.env.PROD && API_BASE_URL_LOOKS_LOCAL) {
  // eslint-disable-next-line no-console
  console.warn(
    `[milkman-frontend] API base URL looks like localhost (${apiBaseUrl}). ` +
      'Set VITE_API_BASE_URL (recommended) or VITE_API_URL in the deployed customer app.',
  )
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
})

let refreshPromise = null
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.assign('/login')
  }
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      clearAuthStorage()
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${apiBaseUrl}/auth/refresh/`, { refresh: refreshToken })
          .then((response) => {
            const newAccess = response.data.access
            localStorage.setItem(ACCESS_TOKEN_KEY, newAccess)
            return newAccess
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAuthStorage()
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)

export default apiClient
