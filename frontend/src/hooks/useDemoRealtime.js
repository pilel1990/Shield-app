import { useEffect } from 'react'
import { DEMO_MODE } from '../constants/config'

/**
 * Simule les événements temps réel en mode démo.
 * En production, Supabase Realtime prend le relais.
 *
 * Séquence simulée :
 * - +4s  : agent accepte la mission (pending → accepted)
 * - +10s : agent démarre la mission (accepted → active)
 */
export function useDemoRealtime(mission, onUpdate) {
  useEffect(() => {
    if (!DEMO_MODE || !mission || !onUpdate) return
    if (mission.statut !== 'pending') return

    const timers = []

    // Agent accepte après 4 secondes
    timers.push(setTimeout(() => {
      onUpdate({ ...mission, statut: 'accepted' })
    }, 4000))

    // Agent démarre après 10 secondes
    timers.push(setTimeout(() => {
      onUpdate({ ...mission, statut: 'active' })
    }, 10000))

    return () => timers.forEach(clearTimeout)
  }, [mission?.id, mission?.statut])
}

/**
 * Simule un message entrant de l'agent en mode démo.
 */
export function useDemoAgentMessages(missionId, statut, onMessage) {
  useEffect(() => {
    if (!DEMO_MODE || !onMessage) return

    const messages = {
      accepted: "Mission acceptée ✅ Je serai à l'heure. À tout à l'heure !",
      active: "Je suis en route, j'arrive dans 5 minutes 🚗",
    }

    const msg = messages[statut]
    if (!msg) return

    const t = setTimeout(() => {
      onMessage({
        id: Date.now(),
        from: 'agent',
        content: msg,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      })
    }, 2000)

    return () => clearTimeout(t)
  }, [statut])
}
