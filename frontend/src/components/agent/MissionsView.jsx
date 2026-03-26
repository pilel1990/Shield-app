import { useState } from 'react'
import { Filter, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { acceptMission, startMission, completeMission } from '../../services/api'
import { TARIFS, formatGNFSimple } from '../../constants/tarifs'
import { MOCK_MISSIONS } from '../../services/mockData'
import { STATUTS_MISSION } from '../../constants/config'
import AgentPhoto from '../shared/AgentPhoto'

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'active', label: 'En cours' },
  { id: 'completed', label: 'Terminées' },
]

export default function MissionsView({ onViewMission }) {
  const { user, token } = useAuth()
  const { showToast } = useApp()
  const [tab, setTab] = useState('all')
  const [missions, setMissions] = useState(MOCK_MISSIONS)
  const [actionLoading, setActionLoading] = useState(null)

  const filtered = tab === 'all' ? missions : missions.filter(m => m.statut === tab)

  const updateStatut = (id, statut) =>
    setMissions(ms => ms.map(m => m.id === id ? { ...m, statut } : m))

  const handleRefuse = (mission) => {
    updateStatut(mission.id, 'cancelled')
    showToast('Mission refusée', 'info')
  }

  const handleAccept = async (mission) => {
    setActionLoading(mission.id + '_accept')
    try {
      await acceptMission(mission.id, token)
      updateStatut(mission.id, 'accepted')
      showToast('Mission acceptée !', 'success')
    } catch (e) { showToast(e.message, 'error') }
    finally { setActionLoading(null) }
  }

  const handleStart = async (mission) => {
    setActionLoading(mission.id + '_start')
    try {
      await startMission(mission.id, token)
      updateStatut(mission.id, 'active')
      showToast('Mission démarrée !', 'success')
    } catch (e) { showToast(e.message, 'error') }
    finally { setActionLoading(null) }
  }

  const handleComplete = async (mission) => {
    setActionLoading(mission.id + '_complete')
    try {
      await completeMission(mission.id, token)
      updateStatut(mission.id, 'completed')
      showToast('Mission terminée ! Paiement en cours de libération.', 'success')
    } catch (e) { showToast(e.message, 'error') }
    finally { setActionLoading(null) }
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-white text-2xl font-bold mb-4">Mes missions</h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${tab === t.id ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              {t.label}
              {t.id !== 'all' && (
                <span className="ml-1.5 text-xs">
                  ({missions.filter(m => m.statut === t.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-2 opacity-30" />
            <p>Aucune mission dans cette catégorie</p>
          </div>
        ) : (
          filtered.map(mission => (
            <MissionDetailCard
              key={mission.id}
              mission={mission}
              onView={() => onViewMission(mission)}
              onAccept={() => handleAccept(mission)}
              onRefuse={() => handleRefuse(mission)}
              onStart={() => handleStart(mission)}
              onComplete={() => handleComplete(mission)}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MissionDetailCard({ mission, onView, onAccept, onRefuse, onStart, onComplete, actionLoading }) {
  const tarif = TARIFS[mission.type]

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between
        ${mission.statut === 'pending' ? 'bg-yellow-900/20 border-b border-yellow-500/20'
          : mission.statut === 'active' ? 'bg-green-900/20 border-b border-green-500/20'
          : 'border-b border-gray-700'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{tarif?.icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">{mission.title}</p>
            <p className="text-gray-400 text-xs">{tarif?.label}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full
          ${mission.statut === 'completed' ? 'bg-gray-700 text-gray-400'
            : mission.statut === 'active' ? 'bg-green-900/60 text-green-400'
            : mission.statut === 'accepted' ? 'bg-blue-900/60 text-blue-400'
            : 'bg-yellow-900/60 text-yellow-400'}`}>
          {STATUTS_MISSION[mission.statut]?.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>📍</span> {mission.adresse}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>📅</span> {new Date(mission.date_mission).toLocaleString('fr-FR')}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>⏱</span> Durée : {mission.duree_heures}h
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-700">
          <span className="text-gray-400 text-xs">Votre rémunération</span>
          <span className="text-green-400 font-bold">{formatGNFSimple(Math.round((mission.prix_total || 0) * 0.75))}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onView}
          className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-all">
          Détails
        </button>
        {mission.statut === 'pending' && (
          <>
            <button onClick={onAccept} disabled={actionLoading === mission.id + '_accept'}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
              {actionLoading === mission.id + '_accept'
                ? <Loader size={16} className="animate-spin" />
                : <><CheckCircle size={14} /> Accepter</>}
            </button>
            <button
              onClick={onRefuse}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-red-900/30 text-red-400 text-sm font-medium rounded-xl flex items-center justify-center gap-1 transition-all">
              <XCircle size={14} /> Refuser
            </button>
          </>
        )}
        {mission.statut === 'accepted' && (
          <button onClick={onStart} disabled={actionLoading === mission.id + '_start'}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
            {actionLoading === mission.id + '_start'
              ? <Loader size={16} className="animate-spin" />
              : '▶ Démarrer la mission'}
          </button>
        )}
        {mission.statut === 'active' && (
          <button onClick={onComplete} disabled={actionLoading === mission.id + '_complete'}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1 transition-all">
            {actionLoading === mission.id + '_complete'
              ? <Loader size={16} className="animate-spin" />
              : '✅ Terminer la mission'}
          </button>
        )}
      </div>
    </div>
  )
}
