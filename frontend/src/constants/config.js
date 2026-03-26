export const APP_NAME = 'ShieldApp'
export const APP_VERSION = '3.0.0'
export const APP_COUNTRY = 'GN'
export const APP_PHONE_PREFIX = '+224'

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const COMMUNES_CONAKRY = [
  'Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto',
  'Coyah', 'Dubréka', 'Kindia',
]

export const MISSION_TYPES = [
  'garde_corps_vip',
  'protection_evenement',
  'surveillance_site',
  'securite_residentielle',
  'escorte_securisee',
  'mission_sur_mesure',
]

export const STATUTS_MISSION = {
  pending: { label: 'En attente', color: 'yellow' },
  accepted: { label: 'Acceptée', color: 'blue' },
  active: { label: 'En cours', color: 'green' },
  completed: { label: 'Terminée', color: 'gray' },
  cancelled: { label: 'Annulée', color: 'red' },
}

export const PAYMENT_METHODS = [
  { id: 'orange', label: 'Orange Money', color: '#FF6600', prefix: '62' },
  { id: 'mtn', label: 'MTN MoMo', color: '#FFCC00', prefix: '65' },
]

// Demo PIN par défaut pour les tests
export const DEMO_PIN = '1234'
