import { Shield, Star, MapPin, Clock, CheckCircle, Award, ChevronLeft, Zap } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { TARIFS } from '../../constants/tarifs'

export default function AgentView({ agent, onBook, onBack }) {
  if (!agent) return null

  return (
    <div className="min-h-screen bg-gray-900 pb-28">
      {/* Header photo */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 pt-14 pb-8 flex flex-col items-center gap-3">
        <button onClick={onBack} className="absolute top-4 left-4 w-9 h-9 bg-gray-800/80 rounded-xl flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <AgentPhoto agent={agent} size="xl" showBadge />
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">{agent.name}</h1>
          <p className="text-gray-400 text-sm">{agent.badge}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-2">
          <div className="text-center">
            <p className="text-yellow-400 font-bold text-xl">{agent.rating}</p>
            <p className="text-gray-500 text-xs">Note</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{agent.missions_count}</p>
            <p className="text-gray-500 text-xs">Missions</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{agent.experience}</p>
            <p className="text-gray-500 text-xs">Années</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap justify-center px-4">
          <span className="flex items-center gap-1 bg-green-900/40 text-green-400 border border-green-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Disponible
          </span>
          {agent.armed && (
            <span className="flex items-center gap-1 bg-red-900/40 text-red-400 border border-red-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
              <Shield size={10} /> Agent armé
            </span>
          )}
          <span className="flex items-center gap-1 bg-blue-900/40 text-blue-400 border border-blue-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
            <Award size={10} /> Certifié ONPSEC
          </span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Localisation */}
        <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-3 border border-gray-700/50">
          <MapPin size={18} className="text-red-400" />
          <div>
            <p className="text-gray-400 text-xs">Zone de couverture</p>
            <p className="text-white font-medium">{agent.commune}, Conakry</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-medium mb-2">À propos</p>
          <p className="text-white text-sm leading-relaxed">{agent.bio}</p>
        </div>

        {/* Types de mission */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-medium mb-3">Spécialisations</p>
          <div className="space-y-2">
            {agent.mission_types?.map(type => {
              const t = TARIFS[type]
              if (!t) return null
              return (
                <div key={type} className="flex items-center gap-3 py-1">
                  <span className="text-xl">{t.icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{t.label}</p>
                    <p className="text-gray-500 text-xs">{t.description}</p>
                  </div>
                  <CheckCircle size={16} className="text-green-400" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Compétences */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-medium mb-3">Compétences</p>
          <div className="flex flex-wrap gap-2">
            {agent.competences?.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm bg-gray-700 text-gray-300 rounded-full px-3 py-1.5">
                <CheckCircle size={12} className="text-green-400" />
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Avis */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <p className="text-white font-semibold">{agent.rating}/5</p>
            <p className="text-gray-500 text-sm">({agent.missions_count} avis)</p>
          </div>
          {/* Demo reviews */}
          {[
            { name: 'Mamadou K.', score: 5, comment: 'Agent très professionnel et ponctuel. Je recommande vivement.', date: 'Il y a 3 jours' },
            { name: 'Fatoumata B.', score: 5, comment: 'Excellent service, notre événement s\'est déroulé sans incident.', date: 'Il y a 1 semaine' },
          ].map((r, i) => (
            <div key={i} className={`py-3 ${i > 0 ? 'border-t border-gray-700' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-white text-sm font-medium">{r.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.score }).map((_, s) => (
                    <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-400 text-xs">{r.comment}</p>
              <p className="text-gray-600 text-xs mt-1">{r.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4">
        <button onClick={() => onBook(agent)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-900/30 transition-all">
          <Zap size={20} />
          Réserver {agent.name.split(' ')[0]}
        </button>
      </div>
    </div>
  )
}
