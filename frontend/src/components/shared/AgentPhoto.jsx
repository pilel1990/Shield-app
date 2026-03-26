import { Shield, Star } from 'lucide-react'

const COLORS = ['bg-red-800', 'bg-blue-800', 'bg-green-800', 'bg-purple-800', 'bg-yellow-800', 'bg-pink-800']

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function AgentPhoto({ agent, size = 'md', showBadge = false, showRating = false }) {
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-sm', badge: 'w-3 h-3' },
    md: { container: 'w-14 h-14', text: 'text-lg', badge: 'w-4 h-4' },
    lg: { container: 'w-20 h-20', text: 'text-2xl', badge: 'w-5 h-5' },
    xl: { container: 'w-28 h-28', text: 'text-3xl', badge: 'w-6 h-6' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div className={`${s.container} rounded-2xl ${getColor(agent?.name)} flex items-center justify-center overflow-hidden flex-shrink-0`}>
        {agent?.photo_url ? (
          <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" />
        ) : (
          <span className={`${s.text} font-bold text-white`}>
            {getInitials(agent?.name)}
          </span>
        )}
      </div>

      {showBadge && agent?.armed && (
        <div className={`absolute -top-1 -right-1 ${s.badge} bg-red-600 rounded-full flex items-center justify-center`}>
          <Shield size={8} className="text-white" />
        </div>
      )}

      {showRating && agent?.rating && (
        <div className="flex items-center gap-0.5 bg-gray-800 rounded-full px-2 py-0.5">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{agent.rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}
