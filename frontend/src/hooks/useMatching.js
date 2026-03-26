import { useState, useCallback } from 'react'
import { matchAgents } from '../services/api'

export function useMatching() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [iaUsed, setIaUsed] = useState(false)
  const [error, setError] = useState(null)

  const match = useCallback(async (missionData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await matchAgents(missionData)
      setAgents(res.agents || [])
      setIaUsed(res.ia_used || false)
      return res.agents
    } catch (e) {
      setError(e.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { agents, loading, iaUsed, error, match }
}
