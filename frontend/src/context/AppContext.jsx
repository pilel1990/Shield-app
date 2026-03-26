import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [currentMission, setCurrentMission] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, id: Date.now() })
    if (duration > 0) {
      setTimeout(() => setToast(null), duration)
    }
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  return (
    <AppContext.Provider value={{
      toast,
      showToast,
      hideToast,
      currentMission,
      setCurrentMission,
      selectedAgent,
      setSelectedAgent,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être dans AppProvider')
  return ctx
}
