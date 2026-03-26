import { useState, useEffect } from 'react'
import { ChevronLeft, MapPin, Phone, CheckCircle, Shield, Star, Send } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { completeMission, sendMessage, rateAgent } from '../../services/api'
import { TARIFS, formatGNFSimple } from '../../constants/tarifs'
import { MOCK_MESSAGES } from '../../services/mockData'
import { useDemoRealtime, useDemoAgentMessages } from '../../hooks/useDemoRealtime'

const MISSION_STEPS_LABELS = [
  { key: 'pending', label: 'En attente', icon: '⏳' },
  { key: 'accepted', label: 'Acceptée', icon: '✅' },
  { key: 'active', label: 'En cours', icon: '🔴' },
  { key: 'completed', label: 'Terminée', icon: '🏁' },
]

export default function LiveView({ mission: initialMission, onBack }) {
  const { token } = useAuth()
  const { showToast } = useApp()
  const [mission, setMission] = useState(initialMission)
  const [tab, setTab] = useState('suivi')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [rated, setRated] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const agent = mission?.agent
  const tarif = TARIFS[mission?.type]
  const stepIdx = MISSION_STEPS_LABELS.findIndex(s => s.key === mission?.statut)

  // Simulation temps réel en mode démo
  useDemoRealtime(mission, (updated) => {
    setMission(updated)
    const labels = { accepted: 'Agent en route ! ✅', active: 'Mission démarrée 🔴' }
    if (labels[updated.statut]) showToast(labels[updated.statut], 'success')
  })
  useDemoAgentMessages(mission?.id, mission?.statut, (msg) => {
    setMessages(m => [...m, msg])
  })

  // Timer si mission active
  useEffect(() => {
    if (mission?.statut !== 'active') return
    const start = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(t)
  }, [mission?.statut])

  const fmtTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await completeMission(mission.id, token)
      setMission(m => ({ ...m, statut: 'completed' }))
      showToast('Mission terminée ! Libération du paiement en cours.', 'success')
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleSendMsg = async () => {
    if (!newMsg.trim()) return
    const msg = { id: Date.now(), from: 'client', content: newMsg, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(m => [...m, msg])
    setNewMsg('')
    await sendMessage(mission.id, newMsg, token).catch(() => {})
  }

  const handleRate = async () => {
    if (!rating) { showToast('Choisissez une note', 'error'); return }
    await rateAgent(mission.id, rating, comment, token).catch(() => {})
    setRated(true)
    showToast('Merci pour votre avis !', 'success')
  }

  if (!mission) return null

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/80 border-b border-gray-700 px-4 pt-12 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 bg-gray-700 rounded-xl flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-base">{mission.title}</h1>
            <p className="text-gray-400 text-xs">{tarif?.label}</p>
          </div>
          {mission.statut === 'active' && (
            <div className="flex items-center gap-1.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold">{fmtTime(elapsed)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center">
          {MISSION_STEPS_LABELS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all
                ${i < stepIdx ? 'bg-green-500 text-white' : i === stepIdx ? 'bg-red-600 text-white ring-2 ring-red-500/40' : 'bg-gray-700 text-gray-500'}`}>
                {i < stepIdx ? '✓' : s.icon}
              </div>
              {i < MISSION_STEPS_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${i < stepIdx ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'suivi', label: 'Suivi' },
          { id: 'chat', label: 'Chat' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-all
              ${tab === t.id ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Suivi */}
      {tab === 'suivi' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
          {/* Agent card */}
          <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-3 border border-gray-700/50">
            <AgentPhoto agent={agent} size="md" showBadge />
            <div className="flex-1">
              <p className="text-white font-bold">{agent?.name}</p>
              <p className="text-gray-400 text-xs">{agent?.badge}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">{agent?.rating}</span>
              </div>
            </div>
            <a href={`tel:${agent?.phone}`} className="w-10 h-10 bg-green-600/20 border border-green-500/30 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-green-400" />
            </a>
          </div>

          {/* Détails mission */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Adresse</p>
                <p className="text-white text-sm">{mission.adresse}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Date et durée</p>
                <p className="text-white text-sm">
                  {new Date(mission.date_mission).toLocaleString('fr-FR')} • {mission.duree_heures}h
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-gray-400 text-sm">Montant total</span>
              <span className="text-red-400 font-bold">{formatGNFSimple(mission.prix_total)}</span>
            </div>
          </div>

          {/* Action selon statut */}
          {mission.statut === 'active' && (
            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-sm text-green-400 flex gap-2">
                <Shield size={16} className="flex-shrink-0 mt-0.5" />
                <p>Mission en cours. L'agent est sur place. Vos fonds sont sécurisés.</p>
              </div>
              <button onClick={handleComplete} disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all">
                ✅ Valider la fin de mission
              </button>
            </div>
          )}

          {/* Notation après complétion */}
          {mission.statut === 'completed' && !rated && (
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
              <p className="text-white font-semibold">Notez {agent?.name}</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all
                      ${s <= rating ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-600'}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Votre commentaire..." rows={2}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-red-500 resize-none" />
              <button onClick={handleRate}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-xl transition-all">
                Envoyer l'avis
              </button>
            </div>
          )}

          {rated && (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle size={40} className="text-green-400" />
              <p className="text-white font-semibold">Merci pour votre avis !</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Chat */}
      {tab === 'chat' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm
                  ${msg.from === 'client'
                    ? 'bg-red-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700'}`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.from === 'client' ? 'text-red-200' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 p-4 flex gap-3">
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
              placeholder="Message..."
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-colors" />
            <button onClick={handleSendMsg} className="w-11 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
