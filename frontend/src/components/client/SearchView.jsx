import { useState, useMemo } from 'react'
import { Search, Filter, MapPin, Star, Shield, X, SlidersHorizontal } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { MOCK_AGENTS } from '../../services/mockData'
import { TARIFS } from '../../constants/tarifs'
import { COMMUNES_CONAKRY, MISSION_TYPES } from '../../constants/config'

export default function SearchView({ onViewAgent, onBookAgent }) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    commune: '',
    type: '',
    armed: null,
    minRating: 0,
    sortBy: 'rating',
  })

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const results = useMemo(() => {
    let agents = [...MOCK_AGENTS]

    if (query.trim()) {
      const q = query.toLowerCase()
      agents = agents.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.commune.toLowerCase().includes(q) ||
        a.bio?.toLowerCase().includes(q) ||
        a.competences?.some(c => c.toLowerCase().includes(q))
      )
    }
    if (filters.commune) agents = agents.filter(a => a.commune === filters.commune)
    if (filters.type) agents = agents.filter(a => a.mission_types?.includes(filters.type))
    if (filters.armed !== null) agents = agents.filter(a => a.armed === filters.armed)
    if (filters.minRating > 0) agents = agents.filter(a => a.rating >= filters.minRating)

    if (filters.sortBy === 'rating') agents.sort((a, b) => b.rating - a.rating)
    else if (filters.sortBy === 'missions') agents.sort((a, b) => b.missions_count - a.missions_count)
    else if (filters.sortBy === 'experience') agents.sort((a, b) => b.experience - a.experience)

    return agents
  }, [query, filters])

  const activeFilterCount = [
    filters.commune, filters.type,
    filters.armed !== null ? 'armed' : '',
    filters.minRating > 0 ? 'rating' : '',
  ].filter(Boolean).length

  const resetFilters = () => setFilters({ commune: '', type: '', armed: null, minRating: 0, sortBy: 'rating' })

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Barre de recherche sticky */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 pt-12 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nom, commune, compétence..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500 transition-colors text-sm"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all
              ${showFilters ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{activeFilterCount}</span>
              </div>
            )}
          </button>
        </div>

        {/* Résultats count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            <span className="text-white font-semibold">{results.length}</span> agent{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="text-red-400 text-xs underline">
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Panneau filtres */}
      {showFilters && (
        <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-4 space-y-4">
          {/* Tri */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2">Trier par</p>
            <div className="flex gap-2">
              {[
                { id: 'rating', label: '⭐ Note' },
                { id: 'missions', label: '✅ Missions' },
                { id: 'experience', label: '🏅 Expérience' },
              ].map(s => (
                <button key={s.id} onClick={() => setFilter('sortBy', s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                    ${filters.sortBy === s.id ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commune */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2">Commune</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('commune', '')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${!filters.commune ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                Toutes
              </button>
              {COMMUNES_CONAKRY.slice(0, 5).map(c => (
                <button key={c} onClick={() => setFilter('commune', filters.commune === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                    ${filters.commune === c ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Type de mission */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2">Spécialisation</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilter('type', '')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${!filters.type ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                Tous
              </button>
              {MISSION_TYPES.map(t => {
                const tarif = TARIFS[t]
                return (
                  <button key={t} onClick={() => setFilter('type', filters.type === t ? '' : t)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                      ${filters.type === t ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                    {tarif?.icon} {tarif?.label.split(' ').slice(0, 2).join(' ')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Armé / Note min */}
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-xs font-medium mb-2">Type d'agent</p>
              <div className="flex gap-2">
                {[
                  { id: null, label: 'Tous' },
                  { id: true, label: '🔫 Armé' },
                  { id: false, label: '✋ Non armé' },
                ].map(o => (
                  <button key={String(o.id)} onClick={() => setFilter('armed', o.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all
                      ${filters.armed === o.id ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note minimum */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2">Note minimum</p>
            <div className="flex gap-2">
              {[0, 4, 4.5, 4.8].map(r => (
                <button key={r} onClick={() => setFilter('minRating', r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                    ${filters.minRating === r ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>
                  {r === 0 ? 'Tous' : `${r}+⭐`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="px-4 mt-4 space-y-3">
        {results.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="text-white font-semibold">Aucun résultat</p>
            <p className="text-gray-500 text-sm">Essayez d'autres mots-clés ou réinitialisez les filtres</p>
            <button onClick={() => { setQuery(''); resetFilters() }}
              className="mt-2 px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-xl text-sm">
              Tout réinitialiser
            </button>
          </div>
        ) : (
          results.map(agent => (
            <AgentSearchCard key={agent.id} agent={agent} onView={() => onViewAgent(agent)} onBook={() => onBookAgent(agent)} />
          ))
        )}
      </div>
    </div>
  )
}

function AgentSearchCard({ agent, onView, onBook }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all">
      <div className="flex gap-3">
        <AgentPhoto agent={agent} size="md" showBadge />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-bold truncate">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={10} /> {agent.commune}
                </span>
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                  <Star size={10} className="fill-yellow-400" /> {agent.rating}
                </span>
                <span className="text-xs text-gray-500">{agent.missions_count} missions</span>
                {agent.armed && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <Shield size={10} /> Armé
                  </span>
                )}
              </div>
            </div>
            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${agent.available ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>

          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{agent.bio}</p>

          {/* Spécialisations */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {agent.mission_types?.slice(0, 3).map(type => {
              const t = TARIFS[type]
              return t ? (
                <span key={type} className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 flex items-center gap-1">
                  {t.icon} {t.label.split(' ').slice(0, 2).join(' ')}
                </span>
              ) : null
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={onView} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-all">
          Voir profil
        </button>
        {agent.available ? (
          <button onClick={onBook} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all">
            Réserver →
          </button>
        ) : (
          <div className="flex-1 py-2.5 bg-gray-700 text-gray-500 text-sm text-center rounded-xl cursor-not-allowed">
            Indisponible
          </div>
        )}
      </div>
    </div>
  )
}
