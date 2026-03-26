import { useState } from 'react'
import { ChevronLeft, User, FileText, MapPin, Shield, Loader, Star, Plus, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { registerAgent } from '../../services/api'
import { COMMUNES_CONAKRY, MISSION_TYPES } from '../../constants/config'
import { TARIFS } from '../../constants/tarifs'
import { useAuth } from '../../context/AuthContext'
import Steps from '../shared/Steps'

const REG_STEPS = ['Infos', 'Compétences', 'Documents']

export default function RegAgent({ phone, token, onSuccess, onBack }) {
  const { showToast } = useApp()
  const { loginDemo } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [newComp, setNewComp] = useState('')

  const [form, setForm] = useState({
    name: '',
    badge: '',
    experience: 1,
    armed: false,
    bio: '',
    commune: 'Kaloum',
    competences: [],
    mission_types: [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addComp = () => {
    if (newComp.trim() && form.competences.length < 8) {
      set('competences', [...form.competences, newComp.trim()])
      setNewComp('')
    }
  }

  const removeComp = (i) => set('competences', form.competences.filter((_, idx) => idx !== i))

  const toggleType = (t) => {
    const types = form.mission_types.includes(t)
      ? form.mission_types.filter(x => x !== t)
      : [...form.mission_types, t]
    set('mission_types', types)
  }

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim()) { showToast('Entrez votre nom', 'error'); return }
      if (!form.badge.trim()) { showToast('Entrez votre numéro de badge', 'error'); return }
    }
    if (step === 1) {
      if (form.mission_types.length === 0) { showToast('Choisissez au moins un type de mission', 'error'); return }
    }
    if (step < REG_STEPS.length - 1) setStep(step + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await registerAgent({ ...form, phone }, token)
      const user = {
        id: `agent-${Date.now()}`,
        phone,
        role: 'agent',
        name: form.name,
        commune: form.commune,
        badge: form.badge,
        available: false,
        status: 'pending',
      }
      showToast('Inscription soumise ! En attente de validation.', 'success')
      onSuccess(user)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl">Inscription Agent</h1>
          <p className="text-gray-400 text-xs">{phone}</p>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Steps steps={REG_STEPS} current={step} />
      </div>

      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-4">
        {/* Step 0 — Infos */}
        {step === 0 && (
          <>
            <div className="space-y-1">
              <label className="text-gray-400 text-sm font-medium">Nom complet *</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Prénom Nom"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-sm font-medium">Numéro de badge ONPSEC *</label>
              <div className="relative">
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="SGP-2024-XXXX"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-sm font-medium">Années d'expérience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 7, 10, 15].map(y => (
                  <button key={y} onClick={() => set('experience', y)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border
                      ${form.experience === y ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                    {y}+
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-sm font-medium">Commune</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select value={form.commune} onChange={e => set('commune', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 appearance-none transition-colors">
                  {COMMUNES_CONAKRY.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
              <div>
                <p className="text-white font-medium text-sm">Agent armé</p>
                <p className="text-gray-500 text-xs">Certification port d'arme requise</p>
              </div>
              <button onClick={() => set('armed', !form.armed)}
                className={`w-12 h-6 rounded-full transition-all ${form.armed ? 'bg-red-600' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.armed ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-sm font-medium">Bio / Présentation</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                placeholder="Décrivez votre expérience et spécialités..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500 transition-colors resize-none" />
            </div>
          </>
        )}

        {/* Step 1 — Compétences */}
        {step === 1 && (
          <>
            <div className="space-y-3">
              <div>
                <p className="text-white font-semibold mb-1">Types de mission</p>
                <p className="text-gray-400 text-xs mb-3">Sélectionnez vos domaines de compétence</p>
                <div className="space-y-2">
                  {MISSION_TYPES.map(type => {
                    const t = TARIFS[type]
                    const selected = form.mission_types.includes(type)
                    return (
                      <button key={type} onClick={() => toggleType(type)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all
                          ${selected ? 'bg-red-600/20 border-red-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                        <span className="text-2xl">{t?.icon}</span>
                        <div className="flex-1 text-left">
                          <p className={`font-medium text-sm ${selected ? 'text-red-400' : 'text-white'}`}>{t?.label}</p>
                          <p className="text-gray-500 text-xs">{t?.description}</p>
                        </div>
                        {selected && <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-1">Compétences spécifiques</p>
                <div className="flex gap-2">
                  <input value={newComp} onChange={e => setNewComp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addComp()}
                    placeholder="Ex: Karaté 3e dan"
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-red-500 transition-colors" />
                  <button onClick={addComp} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2.5 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.competences.map((c, i) => (
                    <span key={i} className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs rounded-full px-3 py-1">
                      {c}
                      <button onClick={() => removeComp(i)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-3">
              <p className="text-white font-semibold">Documents requis</p>
              {['Carte Nationale d\'Identité', 'Badge ONPSEC', 'Attestation de formation', 'Casier judiciaire vierge'].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{doc}</p>
                    <p className="text-gray-500 text-xs">PDF ou image</p>
                  </div>
                  <button className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-3 py-1.5 transition-colors">
                    Téléverser
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-400">
              <Star size={14} className="inline mr-2" />
              Votre dossier sera examiné sous 24-48h. Vous recevrez un SMS de confirmation.
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <button onClick={handleNext} disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
          {loading && <Loader size={20} className="animate-spin" />}
          {step < REG_STEPS.length - 1 ? 'Continuer' : 'Soumettre l\'inscription'}
        </button>
      </div>
    </div>
  )
}
