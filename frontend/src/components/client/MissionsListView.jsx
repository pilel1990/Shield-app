import { useState } from 'react'
import { FileText, ChevronRight } from 'lucide-react'
import { MOCK_MISSIONS } from '../../services/mockData'
import { TARIFS, formatGNFSimple } from '../../constants/tarifs'
import { STATUTS_MISSION } from '../../constants/config'
import AgentPhoto from '../shared/AgentPhoto'

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'accepted', label: 'Acceptées' },
  { id: 'completed', label: 'Terminées' },
]

export default function MissionsListView({ onViewMission }) {
  const [tab, setTab] = useState('all')
  const missions = tab === 'all' ? MOCK_MISSIONS : MOCK_MISSIONS.filter(m => m.statut === tab)

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-white text-2xl font-bold mb-4">Mes missions</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${tab === t.id ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {missions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={40} className="mx-auto mb-2 opacity-30" />
            <p>Aucune mission</p>
          </div>
        ) : missions.map(m => {
          const tarif = TARIFS[m.type]
          return (
            <button key={m.id} onClick={() => onViewMission(m)}
              className="w-full bg-gray-800 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all text-left flex items-center gap-3">
              <AgentPhoto agent={m.agent} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{m.title}</p>
                <p className="text-gray-400 text-xs">{tarif?.label} • {m.duree_heures}h</p>
                <p className="text-gray-500 text-xs">{new Date(m.date_mission).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full block mb-1
                  ${m.statut === 'completed' ? 'bg-gray-700 text-gray-400'
                    : m.statut === 'active' ? 'bg-green-900/40 text-green-400'
                    : m.statut === 'accepted' ? 'bg-blue-900/40 text-blue-400'
                    : 'bg-yellow-900/40 text-yellow-400'}`}>
                  {STATUTS_MISSION[m.statut]?.label}
                </span>
                <span className="text-red-400 text-xs font-bold">{formatGNFSimple(m.prix_total)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
