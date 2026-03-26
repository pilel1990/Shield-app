import { useState } from 'react'
import { ChevronLeft, User, Mail, MapPin, Building, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { COMMUNES_CONAKRY } from '../../constants/config'

export default function RegClient({ phone, token, onSuccess, onBack }) {
  const { showToast } = useApp()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    commune: 'Kaloum',
    type_compte: 'particulier',
    organisation: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast('Entrez votre nom complet', 'error'); return }
    setLoading(true)
    try {
      // In demo mode, just pass through
      const user = {
        id: `client-${Date.now()}`,
        phone,
        role: 'client',
        ...form,
      }
      showToast('Compte créé avec succès !', 'success')
      onSuccess(user)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={onBack} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl">Créer un compte client</h1>
          <p className="text-gray-400 text-xs">{phone}</p>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-4">
        {/* Nom */}
        <div className="space-y-1">
          <label className="text-gray-400 text-sm font-medium">Nom complet *</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Prénom Nom"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-gray-400 text-sm font-medium">Email (optionnel)</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="email@exemple.com"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Commune */}
        <div className="space-y-1">
          <label className="text-gray-400 text-sm font-medium">Commune *</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={form.commune}
              onChange={e => set('commune', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 appearance-none transition-colors"
            >
              {COMMUNES_CONAKRY.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type de compte */}
        <div className="space-y-2">
          <label className="text-gray-400 text-sm font-medium">Type de compte</label>
          <div className="grid grid-cols-2 gap-3">
            {['particulier', 'entreprise'].map(t => (
              <button
                key={t}
                onClick={() => set('type_compte', t)}
                className={`py-3 rounded-xl font-medium capitalize transition-all border
                  ${form.type_compte === t
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Organisation */}
        {form.type_compte === 'entreprise' && (
          <div className="space-y-1">
            <label className="text-gray-400 text-sm font-medium">Nom de l'organisation</label>
            <div className="relative">
              <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={form.organisation}
                onChange={e => set('organisation', e.target.value)}
                placeholder="Société SARL"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
        >
          {loading && <Loader size={20} className="animate-spin" />}
          Créer mon compte
        </button>
      </div>
    </div>
  )
}
