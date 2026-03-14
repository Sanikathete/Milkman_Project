import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import api from '../services/api'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, readStoredJson, clearAuthStorage } from '../services/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem(ACCESS_TOKEN_KEY) || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem(REFRESH_TOKEN_KEY) || '')
  const [user, setUser] = useState(() => readStoredJson(USER_KEY, null))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }, [accessToken])

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }, [refreshToken])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = async (payload) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login/', payload)
      const { access, refresh, user: loggedInUser } = response.data
      setAccessToken(access)
      setRefreshToken(refresh)
      setUser(loggedInUser)
      return loggedInUser
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearAuthStorage()
    setAccessToken('')
    setRefreshToken('')
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      loading,
      login,
      logout,
    }),
    [user, accessToken, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}