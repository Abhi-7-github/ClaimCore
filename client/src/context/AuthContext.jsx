/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useContext, useMemo, useState } from 'react'

import api from '../services/api'
import { API_STORAGE_KEYS, ROLE_HOME_PATH } from '../utils/constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(API_STORAGE_KEYS.token) || '')
  const [role, setRole] = useState(() => localStorage.getItem(API_STORAGE_KEYS.role) || '')
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsReady(true)
        return
      }

      try {
        const response = await api.get('/auth/profile')
        const profileUser = response.data?.data?.user || null

        if (profileUser?.role) {
          setRole(profileUser.role)
        }

        setUser(profileUser)
      } catch {
        localStorage.removeItem(API_STORAGE_KEYS.token)
        localStorage.removeItem(API_STORAGE_KEYS.role)
        setToken('')
        setRole('')
        setUser(null)
      } finally {
        setIsReady(true)
      }
    }

    void bootstrapAuth()
  }, [token])

  const login = ({ token: nextToken, role: nextRole, user: nextUser = null }) => {
    localStorage.setItem(API_STORAGE_KEYS.token, nextToken)
    localStorage.setItem(API_STORAGE_KEYS.role, nextRole)

    setToken(nextToken)
    setRole(nextRole)
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem(API_STORAGE_KEYS.token)
    localStorage.removeItem(API_STORAGE_KEYS.role)

    setToken('')
    setRole('')
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      role,
      user,
      isAuthenticated: Boolean(token),
      isReady,
      login,
      logout,
      homePath: ROLE_HOME_PATH[role] || '/login',
    }),
    [isReady, role, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
