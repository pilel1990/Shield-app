import { useState, useEffect, useCallback } from 'react'
import { getAgents, getAgent } from '../services/api'

export function useAgents(filters = {}) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAgents(filters)
      setAgents(data.agents || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  return { agents, loading, error, refetch: fetchAgents }
}

export function useAgent(id) {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAgent(id)
      .then(data => setAgent(data.agent))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return { agent, loading, error }
}
