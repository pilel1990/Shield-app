import { useState, useEffect, useCallback } from 'react'
import { getMissions, getMission } from '../services/api'
import { useAuth } from '../context/AuthContext'

export function useMissions(filters = {}) {
  const { token } = useAuth()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMissions(token, filters)
      setMissions(data.missions || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { missions, loading, error, refetch: fetch, setMissions }
}

export function useMission(id) {
  const { token } = useAuth()
  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !token) return
    getMission(id, token)
      .then(d => setMission(d.mission))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, token])

  return { mission, loading, setMission }
}
