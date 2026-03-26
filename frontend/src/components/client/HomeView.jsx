import { useState } from 'react'
import { Search, MapPin, Shield, Star, Zap, Clock, ChevronRight, Bell, Filter } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { MOCK_AGENTS, MOCK_MISSIONS } from '../../services/mockData'
import { TARIFS, formatGNFSimple } from '../../constants/tarifs'
import { STATUTS_MISSION } from '../../constants/config'

const URGENCE_OPTIONS = [
  { id: 'normal', label: 'Mission planifiée', icon: '📅', desc: 'Pour les missions prévues à l\'avance', color: 'text-blue-400' },
  { id: 'urgent', label: 'Urgent (+25%)', icon: '⚡', desc: 'Intervention dans les 2-3 heures', color: 'text-yellow-400' },
  { id: 'immediat', label: 'Immédiat (+50%)', icon: '🚨', desc: 'Intervention dans l\'heure', color: 'text-red-400' },
]

export default function HomeView({ onBookAgent, onViewAgent, onViewMission }) {
  const { user } = useAuth()
  const { showToast } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState(null)

  const agents = MOCK_AGENTS.filter(a => a.available)
  const filteredAgents = agents.filter(a =>
    (!searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.commune.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedType || a.mission_types?.includes(selectedType))
  )

  const activeMissions = MOCK_MISSIONS.filter(m => ['accepted', 'active'].includes(m.statut))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-red-950/60 via-gray-900 to-gray-900 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">{greeting},</p>
            <h1 className="text-white text-2xl font-bold">{user?.name?.split(' ')[0] || 'Client'} 👋</h1>
          </div>
          <button className="relative w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-white" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Agents dispo', value: agents.length, icon: <Shield size={16} className="text-green-400" />, color: 'text-green-400' },
            { label: 'Missions actives', value: activeMissions.length, icon: <Zap size={16} className="text-yellow-400" />, color: 'text-yellow-400' },
            { label: 'Note moy.', value: '4.8★', icon: <Star size={16} className="text-yellow-400" />, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800/60 rounded-xl p-2.5 text-center border border-gray-700/50">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un agent ou commune..."
            className="w-full bg-gray-800/80 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      <div className="px-4 space-y-6 mt-2">
        {/* Missions actives */}
        {activeMissions.length > 0 && (
          <div>
            <p className="text-white font-bold text-base mb-3">Missions en cours</p>
            {activeMissions.map(mission => (
              <button key={mission.id} onClick={() => onViewMission(mission)}
                className="w-full bg-gray-800 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 mb-2 hover:border-red-500/60 transition-all">
                <AgentPhoto agent={mission.agent} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm">{mission.title}</p>
                  <p className="text-gray-400 text-xs">{TARIFS[mission.type]?.label}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full
                    ${mission.statut === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                    {STATUTS_MISSION[mission.statut]?.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-600 mt-1 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Types de mission */}
        <div>
          <p className="text-white font-bold text-base mb-3">Type de mission</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setSelectedType(null)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap
                ${!selectedType ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
              Tous
            </button>
            {Object.entries(TARIFS).map(([k, t]) => (
              <button key={k} onClick={() => setSelectedType(selectedType === k ? null : k)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap
                  ${selectedType === k ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                <span>{t.icon}</span> {t.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Urgence */}
        <div>
          <p className="text-white font-bold text-base mb-3">Niveau d'urgence</p>
          <div className="space-y-2">
            {URGENCE_OPTIONS.map(opt => (
              <div key={opt.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3 border border-gray-700/50">
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${opt.color}`}>{opt.label}</p>
                  <p className="text-gray-500 text-xs">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents disponibles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-base">Agents disponibles ({filteredAgents.length})</p>
            <button className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
              <Filter size={14} /> Filtres
            </button>
          </div>

          {filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield size={40} className="mx-auto mb-2 opacity-30" />
              <p>Aucun agent disponible pour ce filtre</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onBook={() => onBookAgent(agent)} onView={() => onViewAgent(agent)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent, onBook, onView }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all">
      <div className="flex items-start gap-3">
        <AgentPhoto agent={agent} size="md" showBadge />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-bold text-base truncate">{agent.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold">{agent.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-gray-500" />
            <span className="text-gray-400 text-xs">{agent.commune}</span>
            <span className="text-gray-600 text-xs mx-1">•</span>
            <Clock size={12} className="text-gray-500" />
            <span className="text-gray-400 text-xs">{agent.experience} ans exp.</span>
            {agent.armed && (
              <>
                <span className="text-gray-600 text-xs mx-1">•</span>
                <span className="text-red-400 text-xs font-medium flex items-center gap-0.5">
                  <Shield size={10} /> Armé
                </span>
              </>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-1 line-clamp-1">{agent.bio}</p>

          {/* Compétences */}
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.competences?.slice(0, 3).map((c, i) => (
              <span key={i} className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">{c}</span>
            ))}
            {agent.competences?.length > 3 && (
              <span className="text-xs text-gray-500">+{agent.competences.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={onView} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-all">
          Voir profil
        </button>
        <button onClick={onBook} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all">
          Réserver →
        </button>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 text-xs font-medium">Disponible maintenant</span>
        <span className="text-gray-600 text-xs mx-1">•</span>
        <span className="text-gray-400 text-xs">{agent.missions_count} missions</span>
      </div>
    </div>
  )
}
