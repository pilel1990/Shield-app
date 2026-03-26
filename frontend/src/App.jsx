import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { useApp } from './context/AppContext'

// Auth
import Onboarding from './components/auth/Onboarding'
import Login from './components/auth/Login'
import RegClient from './components/auth/RegClient'
import RegAgent from './components/auth/RegAgent'

// Client
import HomeView from './components/client/HomeView'
import AgentView from './components/client/AgentView'
import BookingView from './components/client/BookingView'
import LiveView from './components/client/LiveView'
import MissionsListView from './components/client/MissionsListView'
import ClientProfil from './components/client/ClientProfil'

// Agent
import AgentDash from './components/agent/AgentDash'
import MissionsView from './components/agent/MissionsView'
import ProfilView from './components/agent/ProfilView'

// Shared
import Toast from './components/shared/Toast'
import BottomNav from './components/shared/BottomNav'
import Header from './components/shared/Header'

// Auth flow screens
const AUTH_SCREENS = {
  ONBOARDING: 'onboarding',
  ROLE_SELECT: 'role_select',
  LOGIN_CLIENT: 'login_client',
  LOGIN_AGENT: 'login_agent',
  REG_CLIENT: 'reg_client',
  REG_AGENT: 'reg_agent',
}

function RoleSelect({ onSelectClient, onSelectAgent, onBack }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="px-4 pt-14 pb-6">
        <button onClick={onBack} className="text-gray-400 text-sm mb-6 flex items-center gap-1">← Retour</button>
        <h1 className="text-white text-3xl font-extrabold mb-2">Qui êtes-vous ?</h1>
        <p className="text-gray-400">Sélectionnez votre profil pour continuer</p>
      </div>
      <div className="flex-1 px-4 space-y-4">
        <button onClick={onSelectClient}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500/40 rounded-2xl p-6 text-left transition-all group">
          <div className="text-4xl mb-3">🏢</div>
          <h2 className="text-white text-xl font-bold mb-1 group-hover:text-red-400 transition-colors">Client</h2>
          <p className="text-gray-400 text-sm">Je cherche un agent de sécurité pour une mission</p>
        </button>
        <button onClick={onSelectAgent}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500/40 rounded-2xl p-6 text-left transition-all group">
          <div className="text-4xl mb-3">🛡️</div>
          <h2 className="text-white text-xl font-bold mb-1 group-hover:text-red-400 transition-colors">Agent de sécurité</h2>
          <p className="text-gray-400 text-sm">Je suis un agent certifié et je veux proposer mes services</p>
        </button>
      </div>
    </div>
  )
}

function AuthFlow({ onAuthenticated }) {
  const [screen, setScreen] = useState(AUTH_SCREENS.ONBOARDING)
  const [selectedRole, setSelectedRole] = useState(null)
  const [pendingPhone, setPendingPhone] = useState(null)
  const [pendingToken, setPendingToken] = useState(null)

  const handleLoginSuccess = (user) => onAuthenticated(user)

  if (screen === AUTH_SCREENS.ONBOARDING) {
    return <Onboarding onStart={() => setScreen(AUTH_SCREENS.ROLE_SELECT)} />
  }

  if (screen === AUTH_SCREENS.ROLE_SELECT) {
    return (
      <RoleSelect
        onBack={() => setScreen(AUTH_SCREENS.ONBOARDING)}
        onSelectClient={() => { setSelectedRole('client'); setScreen(AUTH_SCREENS.LOGIN_CLIENT) }}
        onSelectAgent={() => { setSelectedRole('agent'); setScreen(AUTH_SCREENS.LOGIN_AGENT) }}
      />
    )
  }

  if (screen === AUTH_SCREENS.LOGIN_CLIENT) {
    return (
      <Login
        defaultRole="client"
        onBack={() => setScreen(AUTH_SCREENS.ROLE_SELECT)}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  if (screen === AUTH_SCREENS.LOGIN_AGENT) {
    return (
      <Login
        defaultRole="agent"
        onBack={() => setScreen(AUTH_SCREENS.ROLE_SELECT)}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  return <Onboarding onStart={() => setScreen(AUTH_SCREENS.ROLE_SELECT)} />
}

// ─── CLIENT APP ──────────────────────────────────────────────────────────────
function ClientApp() {
  const [tab, setTab] = useState('home')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [currentMission, setCurrentMission] = useState(null)
  const [view, setView] = useState('main') // main | agent | booking | live

  const handleBookAgent = (agent) => {
    setSelectedAgent(agent)
    setView('booking')
  }

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent)
    setView('agent')
  }

  const handleViewMission = (mission) => {
    setCurrentMission(mission)
    setView('live')
  }

  const handleBookingSuccess = () => {
    setView('main')
    setTab('missions')
  }

  // Full-screen overlays
  if (view === 'agent' && selectedAgent) {
    return (
      <AgentView
        agent={selectedAgent}
        onBack={() => setView('main')}
        onBook={handleBookAgent}
      />
    )
  }

  if (view === 'booking') {
    return (
      <BookingView
        agent={selectedAgent}
        onBack={() => setView(selectedAgent ? 'agent' : 'main')}
        onSuccess={handleBookingSuccess}
      />
    )
  }

  if (view === 'live' && currentMission) {
    return (
      <LiveView
        mission={currentMission}
        onBack={() => setView('main')}
      />
    )
  }

  // Main tabbed app
  return (
    <div className="min-h-screen bg-gray-900">
      {tab === 'home' && (
        <HomeView
          onBookAgent={handleBookAgent}
          onViewAgent={handleViewAgent}
          onViewMission={handleViewMission}
        />
      )}
      {tab === 'search' && (
        <HomeView
          onBookAgent={handleBookAgent}
          onViewAgent={handleViewAgent}
          onViewMission={handleViewMission}
        />
      )}
      {tab === 'missions' && (
        <MissionsListView onViewMission={handleViewMission} />
      )}
      {tab === 'profil' && <ClientProfil />}

      <BottomNav activeTab={tab} onTabChange={setTab} role="client" />
    </div>
  )
}

// ─── AGENT APP ───────────────────────────────────────────────────────────────
function AgentApp() {
  const [tab, setTab] = useState('dashboard')
  const [currentMission, setCurrentMission] = useState(null)
  const [view, setView] = useState('main')

  const handleViewMission = (mission) => {
    setCurrentMission(mission)
    setView('live')
  }

  if (view === 'live' && currentMission) {
    return (
      <LiveView
        mission={currentMission}
        onBack={() => setView('main')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {tab === 'dashboard' && <AgentDash onViewMission={handleViewMission} />}
      {tab === 'missions' && <MissionsView onViewMission={handleViewMission} />}
      {tab === 'messages' && (
        <div className="flex items-center justify-center min-h-screen text-gray-400 text-center px-8">
          <div>
            <div className="text-5xl mb-4">💬</div>
            <p className="text-white font-semibold text-lg mb-2">Messages</p>
            <p className="text-sm">Sélectionnez une mission active pour accéder au chat.</p>
          </div>
        </div>
      )}
      {tab === 'profil' && <ProfilView />}

      <BottomNav activeTab={tab} onTabChange={setTab} role="agent" />
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-red-900/50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthFlow onAuthenticated={() => window.location.reload()} />
        <Toast />
      </>
    )
  }

  return (
    <>
      {user.role === 'agent' ? <AgentApp /> : <ClientApp />}
      <Toast />
    </>
  )
}
