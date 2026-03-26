import { useState, useEffect, useCallback } from 'react'
import { sendMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MOCK_MESSAGES } from '../services/mockData'

export function useChat(missionId) {
  const { token } = useAuth()
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (content) => {
    if (!content.trim()) return
    const optimistic = {
      id: Date.now(),
      from: 'client',
      content,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(m => [...m, optimistic])
    try {
      await sendMessage(missionId, content, token)
    } catch {
      // En mode démo, ignorer l'erreur réseau
    }
  }, [missionId, token])

  return { messages, loading, send, setMessages }
}
