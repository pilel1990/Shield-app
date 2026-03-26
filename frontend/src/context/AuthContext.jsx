import { createContext, useContext, useState, useEffect } from 'react'
import { DEMO_MODE, DEMO_PIN } from '../constants/config'
import { loginWithPin, sendOTP, verifyOTP, setPin } from '../services/api'
import { MOCK_CLIENT, MOCK_AGENT_USER } from '../services/mockData'

const AuthContext = createContext(null)

const STORAGE_KEY = 'shieldapp_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const { user: u, token: t } = JSON.parse(stored)
        setUser(u)
        setToken(t)
      } catch {}
    }
    setLoading(false)
  }, [])

  const saveSession = (user, token) => {
    setUser(user)
    setToken(token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
  }

  const clearSession = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const requestOTP = async (phone) => {
    return sendOTP(phone)
  }

  const confirmOTP = async (phone, otp) => {
    return verifyOTP(phone, otp)
  }

  const createPin = async (phone, pin, otpToken) => {
    return setPin(phone, pin, otpToken)
  }

  const login = async (phone, pin, role = 'client') => {
    const data = await loginWithPin(phone, pin)
    const userData = data.user || {
      id: `user-${Date.now()}`,
      phone,
      role,
      name: role === 'client' ? 'Client' : 'Agent',
      commune: 'Kaloum',
    }
    saveSession(userData, data.token || 'demo-token')
    return userData
  }

  const loginDemo = (role = 'client') => {
    const demoUser = role === 'client'
      ? { ...MOCK_CLIENT }
      : { ...MOCK_AGENT_USER, role: 'agent' }
    saveSession(demoUser, 'demo-token')
    return demoUser
  }

  const logout = () => {
    clearSession()
  }

  const isClient = user?.role === 'client'
  const isAgent = user?.role === 'agent'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isClient,
      isAgent,
      requestOTP,
      confirmOTP,
      createPin,
      login,
      loginDemo,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
