import { useState } from 'react'
import { ChevronLeft, MapPin, Clock, Calendar, CreditCard, Shield, Loader, AlertTriangle, CheckCircle } from 'lucide-react'
import AgentPhoto from '../shared/AgentPhoto'
import Steps from '../shared/Steps'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { createMission, initiatePayment, matchAgents } from '../../services/api'
import { TARIFS, formatGNFSimple, MIN_HEURES, MAJORATION_URGENT, MAJORATION_IMMEDIAT, FRAIS_SERVICE_CLIENT } from '../../constants/tarifs'
import { COMMUNES_CONAKRY, PAYMENT_METHODS, MISSION_TYPES } from '../../constants/config'
import { MOCK_AGENTS } from '../../services/mockData'

const BOOK_STEPS = ['Mission', 'Détails', 'Paiement', 'Confirmation']

export default function BookingView({ agent: initialAgent, onBack, onSuccess }) {
  const { user, token } = useAuth()
  const { showToast } = useApp()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [matchedAgents, setMatchedAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(initialAgent)
  const [payRef, setPayRef] = useState(null)

  const [form, setForm] = useState({
    type: initialAgent?.mission_types?.[0] || 'garde_corps_vip',
    urgence: 'normal',
    duree_heures: MIN_HEURES,
    date_mission: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    adresse: '',
    description: '',
    paymentMethod: 'orange',
    paymentPhone: user?.phone || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const tarif = TARIFS[form.type] || TARIFS['garde_corps_vip']
  const prixBase = (tarif.prix_heure || 0) * form.duree_heures
  const majoration = form.urgence === 'urgent' ? MAJORATION_URGENT : form.urgence === 'immediat' ? MAJORATION_IMMEDIAT : 0
  const prixMajore = Math.round(prixBase * (1 + majoration))
  const fraisService = Math.round(prixMajore * FRAIS_SERVICE_CLIENT)
  const total = prixMajore + fraisService

  const handleMatchIA = async () => {
    setLoading(true)
    try {
      const res = await matchAgents({ type: form.type, urgence: form.urgence, commune: user?.commune })
      setMatchedAgents(res.agents)
      if (!selectedAgent) setSelectedAgent(res.agents[0])
    } catch (e) {
      setMatchedAgents(MOCK_AGENTS.filter(a => a.available))
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (step === 0) {
      if (!selectedAgent) { showToast('Sélectionnez un agent', 'error'); return }
      await handleMatchIA()
      setStep(1)
    } else if (step === 1) {
      if (!form.adresse.trim()) { showToast('Entrez l\'adresse de mission', 'error'); return }
      setStep(2)
    } else if (step === 2) {
      await handlePayment()
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const mission = await createMission({
        agent_id: selectedAgent.id,
        client_id: user.id,
        type: form.type,
        title: `${tarif?.label} — ${form.adresse}`,
        description: form.description,
        duree_heures: form.duree_heures,
        date_mission: form.date_mission,
        adresse: form.adresse,
        urgence: form.urgence,
        prix_total: total,
      }, token)

      const pay = await initiatePayment({
        mission_id: mission.mission?.id,
        amount_gnf: total,
        method: form.paymentMethod,
        phone: form.paymentPhone,
      }, token)

      setPayRef(pay.reference)
      setStep(3)
      showToast('Mission créée et paiement initié !', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-bold text-xl">Réserver un agent</h1>
      </div>

      <div className="px-4 pb-4">
        <Steps steps={BOOK_STEPS} current={step} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-32">
        {/* Step 0 — Type & agent */}
        {step === 0 && (
          <>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Type de mission</p>
              <div className="space-y-2">
                {MISSION_TYPES.map(type => {
                  const t = TARIFS[type]
                  const selected = form.type === type
                  return (
                    <button key={type} onClick={() => set('type', type)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all
                        ${selected ? 'bg-red-600/20 border-red-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                      <span className="text-2xl">{t?.icon}</span>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${selected ? 'text-red-400' : 'text-white'}`}>{t?.label}</p>
                        <p className="text-gray-500 text-xs">{t?.description}</p>
                      </div>
                      {selected && <CheckCircle size={18} className="text-red-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Urgence</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal', icon: '📅' },
                  { id: 'urgent', label: 'Urgent +25%', icon: '⚡' },
                  { id: 'immediat', label: 'Immédiat +50%', icon: '🚨' },
                ].map(u => (
                  <button key={u.id} onClick={() => set('urgence', u.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all
                      ${form.urgence === u.id ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                    <span className="text-xl">{u.icon}</span>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent sélectionné */}
            {selectedAgent && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-green-500/30">
                <p className="text-green-400 text-xs font-medium mb-2">Agent sélectionné</p>
                <div className="flex items-center gap-3">
                  <AgentPhoto agent={selectedAgent} size="sm" showBadge />
                  <div>
                    <p className="text-white font-semibold">{selectedAgent.name}</p>
                    <p className="text-gray-400 text-xs">{selectedAgent.commune} • {selectedAgent.rating}★</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 1 — Détails */}
        {step === 1 && (
          <>
            {/* Résumé tarif */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <AgentPhoto agent={selectedAgent} size="sm" />
                <div>
                  <p className="text-white font-semibold">{selectedAgent?.name}</p>
                  <p className="text-gray-400 text-xs">{tarif?.label}</p>
                </div>
              </div>
            </div>

            {/* Durée */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium">Durée (min. {MIN_HEURES}h)</p>
              <div className="flex items-center gap-3">
                <button onClick={() => form.duree_heures > MIN_HEURES && set('duree_heures', form.duree_heures - 1)}
                  className="w-10 h-10 bg-gray-800 rounded-xl text-white font-bold text-xl flex items-center justify-center">−</button>
                <div className="flex-1 bg-gray-800 rounded-xl py-3 text-center">
                  <span className="text-white font-bold text-2xl">{form.duree_heures}</span>
                  <span className="text-gray-400 text-sm"> heures</span>
                </div>
                <button onClick={() => set('duree_heures', form.duree_heures + 1)}
                  className="w-10 h-10 bg-gray-800 rounded-xl text-white font-bold text-xl flex items-center justify-center">+</button>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <Calendar size={14} /> Date et heure
              </label>
              <input type="datetime-local" value={form.date_mission}
                onChange={e => set('date_mission', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500 transition-colors" />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <MapPin size={14} /> Adresse de la mission *
              </label>
              <input value={form.adresse} onChange={e => set('adresse', e.target.value)}
                placeholder="Ex: Hôtel Kaloum, Quartier Almamya..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500 transition-colors" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium">Description (optionnel)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Précisions sur la mission..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500 transition-colors resize-none" />
            </div>
          </>
        )}

        {/* Step 2 — Paiement */}
        {step === 2 && (
          <>
            {/* Récapitulatif prix */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
              <p className="text-white font-semibold">Récapitulatif</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{tarif?.label}</span>
                  <span className="text-white">{form.duree_heures}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-white">{formatGNFSimple(prixBase)}</span>
                </div>
                {majoration > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Majoration urgence (+{Math.round(majoration * 100)}%)</span>
                    <span>+{formatGNFSimple(prixMajore - prixBase)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Frais de service (5%)</span>
                  <span className="text-white">{formatGNFSimple(fraisService)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-red-400 font-bold text-lg">{formatGNFSimple(total)}</span>
                </div>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium">Mode de paiement</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} onClick={() => set('paymentMethod', m.id)}
                    className={`flex items-center gap-2 p-4 rounded-xl border font-semibold text-sm transition-all
                      ${form.paymentMethod === m.id ? 'border-red-500 bg-red-600/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de paiement */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <CreditCard size={14} /> Numéro {form.paymentMethod === 'orange' ? 'Orange Money' : 'MTN MoMo'}
              </label>
              <input value={form.paymentPhone} onChange={e => set('paymentPhone', e.target.value)}
                placeholder="+224 620 000 000"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500 transition-colors" />
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-400 flex gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <p>Les fonds seront bloqués en escrow jusqu'à la fin de la mission. Remboursement total si l'agent n'arrive pas.</p>
            </div>
          </>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-white text-2xl font-bold">Mission créée !</h2>
              <p className="text-gray-400">Votre agent a été notifié et acceptera sous peu.</p>
            </div>
            {payRef && (
              <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 w-full">
                <p className="text-gray-400 text-xs">Référence paiement</p>
                <p className="text-white font-mono font-bold">{payRef}</p>
              </div>
            )}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 w-full text-left space-y-2">
              <div className="flex items-center gap-3">
                <AgentPhoto agent={selectedAgent} size="sm" />
                <div>
                  <p className="text-white font-semibold">{selectedAgent?.name}</p>
                  <p className="text-gray-400 text-xs">{tarif?.label} • {form.duree_heures}h</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={12} /> <span>{form.adresse}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock size={12} /> <span>{new Date(form.date_mission).toLocaleString('fr-GN')}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between">
                <span className="text-gray-400 text-sm">Total payé</span>
                <span className="text-red-400 font-bold">{formatGNFSimple(total)}</span>
              </div>
            </div>

            <button onClick={onSuccess}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all">
              Voir mes missions
            </button>
          </div>
        )}
      </div>

      {/* CTA fixe */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4">
          {step === 1 && (
            <div className="flex justify-between text-sm mb-2 px-1">
              <span className="text-gray-400">Total estimé</span>
              <span className="text-red-400 font-bold">{formatGNFSimple(total)}</span>
            </div>
          )}
          <button onClick={handleNext} disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
            {loading && <Loader size={20} className="animate-spin" />}
            {step === 0 ? 'Continuer' : step === 1 ? 'Choisir le paiement' : `Payer ${formatGNFSimple(total)}`}
          </button>
        </div>
      )}
    </div>
  )
}
