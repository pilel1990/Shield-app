import { useState } from 'react'
import { Shield, Zap, Clock, Star, TrendingUp, ToggleLeft, ToggleRight, Bell, ChevronRight, CheckCircle } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { toggleAvailability } from '../../services/api'
import { TARIFS, formatGNFSimple } from '../../constants/tarifs'
import { MOCK_MISSIONS } from '../../services/mockData'
import { STATUTS_MISSION } from '../../constants/config'

export default function AgentDash({ onViewMission }) {
  const { user, token } = useAuth()
  const { showToast } = useApp()
  const [available, setAvailable] = useState(user?.available ?? true)
  const [loading, setLoading] = useState(false)

  const myMissions = MOCK_MISSIONS.filter(m => m.agent_id === user?.id || true)
  const pending = myMissions.filter(m => m.statut === 'pending')
  const active = myMissions.filter(m => m.statut === 'active')
  const completed = myMissions.filter(m => m.statut === 'completed')

  const totalEarned = completed.reduce((s, m) => s + Math.round((m.prix_total || 0) * 0.75), 0)
  const avgRating = 4.8

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleAvailability(user?.id, !available, token)
      setAvailable(!available)
      showToast(available ? 'Vous êtes maintenant hors ligne' : 'Vous êtes maintenant en ligne !', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AgentPhoto agent={user} size="md" />
            <div>
              <p className="text-gray-400 text-sm">Tableau de bord</p>
              <h1 className="text-white text-xl font-bold">{user?.name}</h1>
              <p className="text-gray-500 text-xs">{user?.badge}</p>
            </div>
          </div>
          <button className="relative w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-white" />
            {pending.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{pending.length}</span>
              </div>
            )}
          </button>
        </div>

        {/* Toggle disponibilité */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
            ${available
              ? 'bg-green-900/30 border-green-500/40'
              : 'bg-gray-800 border-gray-700'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <div className="text-left">
              <p className={`font-bold text-sm ${available ? 'text-green-400' : 'text-gray-400'}`}>
                {available ? 'En ligne — Disponible' : 'Hors ligne'}
              </p>
              <p className="text-gray-500 text-xs">
                {available ? 'Vous recevez de nouvelles missions' : 'Vous ne recevez pas de missions'}
              </p>
            </div>
          </div>
          {available
            ? <ToggleRight size={32} className="text-green-400" />
            : <ToggleLeft size={32} className="text-gray-500" />}
        </button>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Missions', value: myMissions.length, icon: <Shield size={16} className="text-red-400" />, color: 'text-red-400' },
            { label: 'Gains totaux', value: `${(totalEarned / 1000000).toFixed(1)}M`, icon: <TrendingUp size={16} className="text-green-400" />, color: 'text-green-400' },
            { label: 'Note', value: `${avgRating}★`, icon: <Star size={16} className="text-yellow-400" />, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Missions en attente */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="text-white font-bold text-base">Nouvelles missions ({pending.length})</p>
            </div>
            {pending.map(m => (
              <MissionCard key={m.id} mission={m} onView={() => onViewMission(m)} highlight />
            ))}
          </div>
        )}

        {/* Mission active */}
        {active.length > 0 && (
          <div>
            <p className="text-white font-bold text-base mb-3">En cours</p>
            {active.map(m => (
              <MissionCard key={m.id} mission={m} onView={() => onViewMission(m)} />
            ))}
          </div>
        )}

        {/* Statistiques hebdo */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-medium mb-3">Cette semaine</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Missions</p>
              <p className="text-white font-bold text-xl">3</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Heures</p>
              <p className="text-white font-bold text-xl">18</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Gains</p>
              <p className="text-green-400 font-bold text-base">{formatGNFSimple(1350000)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Taux d'acceptation</p>
              <p className="text-blue-400 font-bold text-xl">95%</p>
            </div>
          </div>
        </div>

        {/* Historique récent */}
        <div>
          <p className="text-white font-bold text-base mb-3">Historique récent</p>
          {completed.slice(0, 3).map(m => (
            <MissionCard key={m.id} mission={m} onView={() => onViewMission(m)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MissionCard({ mission, onView, highlight }) {
  const tarif = TARIFS[mission.type]
  const statut = STATUTS_MISSION[mission.statut]

  return (
    <button onClick={onView}
      className={`w-full bg-gray-800 rounded-2xl p-4 mb-2 border transition-all text-left
        ${highlight ? 'border-yellow-500/40 bg-yellow-900/10' : 'border-gray-700/50 hover:border-gray-600'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{mission.title}</p>
          <p className="text-gray-400 text-xs">{tarif?.label} • {mission.duree_heures}h</p>
          <p className="text-gray-500 text-xs mt-0.5">{mission.adresse}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full
            ${mission.statut === 'completed' ? 'bg-gray-700 text-gray-400'
              : mission.statut === 'active' ? 'bg-green-900/40 text-green-400'
              : mission.statut === 'accepted' ? 'bg-blue-900/40 text-blue-400'
              : 'bg-yellow-900/40 text-yellow-400'}`}>
            {statut?.label}
          </span>
          <p className="text-green-400 font-bold text-sm mt-1">
            {formatGNFSimple(Math.round((mission.prix_total || 0) * 0.75))}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <Clock size={10} /> {new Date(mission.date_mission).toLocaleDateString('fr-FR')}
        </p>
        <ChevronRight size={14} className="text-gray-600" />
      </div>
    </button>
  )
}

