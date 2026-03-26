import { API_URL, DEMO_MODE } from '../constants/config'
import { MOCK_AGENTS, MOCK_MISSIONS } from './mockData'

const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new Error(err.message || 'Erreur serveur')
  }
  return res.json()
}

// AUTH
export const sendOTP = async (phone) => {
  if (DEMO_MODE) {
    await delay(800)
    return { success: true, message: 'OTP envoyé (démo: 1234)' }
  }
  return request('POST', '/api/auth/send-otp', { phone })
}

export const verifyOTP = async (phone, otp) => {
  if (DEMO_MODE) {
    await delay(600)
    if (otp === '1234') return { success: true, token: 'demo-token' }
    throw new Error('Code incorrect. Utilisez 1234 en mode démo')
  }
  return request('POST', '/api/auth/verify-otp', { phone, otp })
}

export const setPin = async (phone, pin, token) => {
  if (DEMO_MODE) {
    await delay(500)
    return { success: true }
  }
  return request('POST', '/api/auth/set-pin', { phone, pin }, token)
}

export const loginWithPin = async (phone, pin) => {
  if (DEMO_MODE) {
    await delay(600)
    const user = MOCK_AGENTS.find(a => a.phone === phone) || {
      id: 'demo-client-1',
      phone,
      role: 'client',
      name: 'Client Démo',
      commune: 'Kaloum',
    }
    return { success: true, token: 'demo-token', user }
  }
  return request('POST', '/api/auth/login', { phone, pin })
}

// AGENTS
export const getAgents = async (filters = {}) => {
  if (DEMO_MODE) {
    await delay(500)
    let agents = MOCK_AGENTS.filter(a => a.available)
    if (filters.type) agents = agents.filter(a => a.mission_types?.includes(filters.type))
    if (filters.commune) agents = agents.filter(a => a.commune === filters.commune)
    return { agents }
  }
  const params = new URLSearchParams(filters).toString()
  return request('GET', `/api/agents${params ? '?' + params : ''}`)
}

export const getAgent = async (id) => {
  if (DEMO_MODE) {
    await delay(300)
    const agent = MOCK_AGENTS.find(a => a.id === id)
    if (!agent) throw new Error('Agent non trouvé')
    return { agent }
  }
  return request('GET', `/api/agents/${id}`)
}

export const registerAgent = async (data, token) => {
  if (DEMO_MODE) {
    await delay(1000)
    return { success: true, agent: { id: 'new-agent', ...data } }
  }
  return request('POST', '/api/agents/register', data, token)
}

export const toggleAvailability = async (agentId, available, token) => {
  if (DEMO_MODE) {
    await delay(400)
    return { success: true, available }
  }
  return request('PUT', `/api/agents/${agentId}/availability`, { available }, token)
}

// MISSIONS
export const createMission = async (data, token) => {
  if (DEMO_MODE) {
    await delay(800)
    const mission = {
      id: `mission-${Date.now()}`,
      ...data,
      statut: 'pending',
      created_at: new Date().toISOString(),
    }
    return { success: true, mission }
  }
  return request('POST', '/api/missions', data, token)
}

export const getMission = async (id, token) => {
  if (DEMO_MODE) {
    await delay(300)
    const mission = MOCK_MISSIONS.find(m => m.id === id) || MOCK_MISSIONS[0]
    return { mission }
  }
  return request('GET', `/api/missions/${id}`, null, token)
}

export const getMissions = async (token, filters = {}) => {
  if (DEMO_MODE) {
    await delay(400)
    return { missions: MOCK_MISSIONS }
  }
  const params = new URLSearchParams(filters).toString()
  return request('GET', `/api/missions${params ? '?' + params : ''}`, null, token)
}

export const acceptMission = async (id, token) => {
  if (DEMO_MODE) {
    await delay(600)
    return { success: true, statut: 'accepted' }
  }
  return request('PUT', `/api/missions/${id}/accept`, null, token)
}

export const startMission = async (id, token) => {
  if (DEMO_MODE) {
    await delay(600)
    return { success: true, statut: 'active' }
  }
  return request('PUT', `/api/missions/${id}/start`, null, token)
}

export const completeMission = async (id, token) => {
  if (DEMO_MODE) {
    await delay(600)
    return { success: true, statut: 'completed' }
  }
  return request('PUT', `/api/missions/${id}/complete`, null, token)
}

// MATCHING IA
export const matchAgents = async (missionData) => {
  if (DEMO_MODE) {
    await delay(1200)
    // Scoring simple demo
    const scored = MOCK_AGENTS.filter(a => a.available).map(agent => ({
      ...agent,
      score: Math.round(
        (agent.rating / 5) * 40 +
        Math.min(agent.missions_count / 50, 1) * 30 +
        (agent.armed ? 20 : 10) +
        Math.random() * 10
      ),
    }))
    scored.sort((a, b) => b.score - a.score)
    return { agents: scored, ia_used: false }
  }
  return request('POST', '/api/matching', missionData)
}

// PAIEMENTS
export const initiatePayment = async (data, token) => {
  if (DEMO_MODE) {
    await delay(1000)
    return {
      success: true,
      reference: `DEMO-${Date.now()}`,
      message: 'Paiement simulé (mode démo)',
    }
  }
  return request('POST', '/api/payments/initiate', data, token)
}

export const sendMessage = async (missionId, content, token) => {
  if (DEMO_MODE) {
    await delay(300)
    return {
      success: true,
      message: { id: Date.now(), content, created_at: new Date().toISOString() },
    }
  }
  return request('POST', `/api/missions/${missionId}/messages`, { content }, token)
}

export const rateAgent = async (missionId, score, comment, token) => {
  if (DEMO_MODE) {
    await delay(500)
    return { success: true }
  }
  return request('POST', `/api/missions/${missionId}/rate`, { score, comment }, token)
}

// Utilitaire
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
