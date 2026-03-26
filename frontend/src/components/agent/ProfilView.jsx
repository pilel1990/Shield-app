import { useState } from 'react'
import { Shield, Star, MapPin, Edit2, LogOut, ChevronRight, CheckCircle, Award } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { TARIFS } from '../../constants/tarifs'
import { COMMUNES_CONAKRY } from '../../constants/config'

export default function ProfilView() {
  const { user, logout } = useAuth()
  const { showToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio || '')
  const [commune, setCommune] = useState(user?.commune || 'Kaloum')

  const handleSave = () => {
    setEditing(false)
    showToast('Profil mis à jour !', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Header profil */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-12 pb-6 flex flex-col items-center gap-3">
        <AgentPhoto agent={user} size="xl" showBadge />
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.badge}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full
              ${user?.status === 'active'
                ? 'bg-green-900/40 text-green-400 border border-green-500/30'
                : 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30'}`}>
              {user?.status === 'active' ? '✅ Certifié actif' : '⏳ En attente validation'}
            </span>
            {user?.armed && (
              <span className="flex items-center gap-1 bg-red-900/40 text-red-400 border border-red-500/30 text-xs font-medium px-3 py-1 rounded-full">
                <Shield size={10} /> Armé
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-2">
          <div className="text-center">
            <p className="text-yellow-400 font-bold text-xl">{user?.rating || 4.9}</p>
            <p className="text-gray-500 text-xs">Note</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{user?.missions_count || 0}</p>
            <p className="text-gray-500 text-xs">Missions</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{user?.experience || 1}</p>
            <p className="text-gray-500 text-xs">Années</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Bio */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-medium">Bio</p>
            <button onClick={() => setEditing(!editing)} className="text-red-400 text-xs flex items-center gap-1">
              <Edit2 size={12} /> {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          {editing ? (
            <div className="space-y-2">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-red-500 resize-none" />
              <div className="space-y-1">
                <p className="text-gray-400 text-xs">Commune</p>
                <select value={commune} onChange={e => setCommune(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-red-500 appearance-none">
                  {COMMUNES_CONAKRY.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleSave} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
                Enregistrer
              </button>
            </div>
          ) : (
            <p className="text-white text-sm leading-relaxed">{bio || user?.bio || 'Aucune bio renseignée.'}</p>
          )}
        </div>

        {/* Informations */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
          <p className="text-gray-400 text-sm font-medium">Informations</p>
          {[
            { label: 'Téléphone', value: user?.phone },
            { label: 'Commune', value: commune },
            { label: 'Expérience', value: `${user?.experience || 1} ans` },
            { label: 'Type', value: user?.armed ? 'Agent armé' : 'Agent non armé' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
              <span className="text-gray-400 text-sm">{item.label}</span>
              <span className="text-white text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Spécialisations */}
        {user?.mission_types?.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm font-medium mb-3">Spécialisations</p>
            <div className="space-y-2">
              {user.mission_types.map(type => {
                const t = TARIFS[type]
                return t ? (
                  <div key={type} className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="text-white text-sm">{t.label}</span>
                    <CheckCircle size={14} className="text-green-400 ml-auto" />
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Compétences */}
        {user?.competences?.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm font-medium mb-3">Compétences</p>
            <div className="flex flex-wrap gap-2">
              {user.competences.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs bg-gray-700 text-gray-300 rounded-full px-3 py-1.5">
                  <CheckCircle size={10} className="text-green-400" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-gray-400 text-sm font-medium mb-3">Certifications</p>
          {[
            { label: 'Badge ONPSEC', valid: true },
            { label: 'Formation sécurité', valid: true },
            { label: "Port d'arme", valid: user?.armed },
          ].filter(c => c.valid !== false || c.valid).map(cert => (
            <div key={cert.label} className="flex items-center gap-2 py-2 border-b border-gray-700 last:border-0">
              <Award size={16} className={cert.valid ? 'text-yellow-400' : 'text-gray-600'} />
              <span className={`text-sm ${cert.valid ? 'text-white' : 'text-gray-600'}`}>{cert.label}</span>
              {cert.valid && <CheckCircle size={14} className="text-green-400 ml-auto" />}
            </div>
          ))}
        </div>

        {/* Déconnexion */}
        <button onClick={logout}
          className="w-full flex items-center justify-between bg-red-900/20 border border-red-500/20 rounded-2xl p-4 text-red-400 hover:bg-red-900/30 transition-all">
          <div className="flex items-center gap-3">
            <LogOut size={18} />
            <span className="font-medium">Se déconnecter</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
