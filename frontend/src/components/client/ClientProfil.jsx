import { Shield, User, Phone, MapPin, LogOut, ChevronRight, FileText, Star, QrCode } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { MOCK_MISSIONS } from '../../services/mockData'
import { formatGNFSimple } from '../../constants/tarifs'

export default function ClientProfil({ onShowQR }) {
  const { user, logout } = useAuth()
  const { showToast } = useApp()

  const totalMissions = MOCK_MISSIONS.length
  const totalSpent = MOCK_MISSIONS.reduce((s, m) => s + (m.prix_total || 0), 0)

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-12 pb-8 flex flex-col items-center gap-3">
        <div className="w-24 h-24 bg-red-800 rounded-3xl flex items-center justify-center">
          <span className="text-white text-3xl font-bold">
            {(user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">{user?.name || 'Client'}</h1>
          <p className="text-gray-400 text-sm">{user?.phone}</p>
          <span className="mt-1 inline-block text-xs bg-blue-900/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
            {user?.type_compte || 'Particulier'}
          </span>
        </div>
        {/* Stats */}
        <div className="flex gap-8 mt-2">
          <div className="text-center">
            <p className="text-white font-bold text-xl">{totalMissions}</p>
            <p className="text-gray-500 text-xs">Missions</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-base">{formatGNFSimple(totalSpent)}</p>
            <p className="text-gray-500 text-xs">Total dépensé</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Infos */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
          <p className="text-gray-400 text-sm font-medium">Informations personnelles</p>
          {[
            { icon: <User size={16} className="text-gray-500" />, label: 'Nom', value: user?.name },
            { icon: <Phone size={16} className="text-gray-500" />, label: 'Téléphone', value: user?.phone },
            { icon: <MapPin size={16} className="text-gray-500" />, label: 'Commune', value: user?.commune },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 py-1 border-b border-gray-700 last:border-0">
              {item.icon}
              <span className="text-gray-400 text-sm flex-1">{item.label}</span>
              <span className="text-white text-sm font-medium">{item.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        {[
          { icon: <FileText size={18} className="text-blue-400" />, label: 'Historique complet', count: totalMissions },
          { icon: <Star size={18} className="text-yellow-400" />, label: 'Mes avis' },
          { icon: <Shield size={18} className="text-green-400" />, label: 'Sécurité du compte' },
          { icon: <QrCode size={18} className="text-purple-400" />, label: 'Partager l\'app', action: onShowQR },
        ].map(item => (
          <button key={item.label} onClick={item.action}
            className="w-full flex items-center gap-3 bg-gray-800 rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all">
            {item.icon}
            <span className="flex-1 text-white text-sm font-medium text-left">{item.label}</span>
            {item.count !== undefined && (
              <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">{item.count}</span>
            )}
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        ))}

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
