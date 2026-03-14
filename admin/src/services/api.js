import axios from 'axios'

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthStorage } from './authStorage'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: apiBaseUrl,
})

let refreshPromise = null

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.assign('/login')
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
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
      return api(originalRequest)
    } catch (refreshError) {
      clearAuthStorage()
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)

export default api
