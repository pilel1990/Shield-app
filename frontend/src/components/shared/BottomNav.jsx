import { Home, Search, FileText, MessageSquare, User } from 'lucide-react'

const CLIENT_TABS = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'search', label: 'Agents', icon: Search },
  { id: 'missions', label: 'Missions', icon: FileText },
  { id: 'profil', label: 'Profil', icon: User },
]

const AGENT_TABS = [
  { id: 'dashboard', label: 'Tableau', icon: Home },
  { id: 'missions', label: 'Missions', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profil', label: 'Profil', icon: User },
]

export default function BottomNav({ activeTab, onTabChange, role = 'client' }) {
  const tabs = role === 'agent' ? AGENT_TABS : CLIENT_TABS

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 gap-1 transition-all
                ${active ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-red-500' : ''}`}>
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
