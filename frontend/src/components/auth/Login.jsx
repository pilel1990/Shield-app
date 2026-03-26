import { useState } from 'react'
import { Shield, Phone, Lock, Eye, EyeOff, ChevronLeft, Loader } from 'lucide-react'
import Steps from '../shared/Steps'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { DEMO_MODE } from '../../constants/config'

const STEPS = ['Téléphone', 'Code OTP', 'PIN']

export default function Login({ onBack, onSuccess, defaultRole = 'client' }) {
  const { requestOTP, confirmOTP, createPin, login, loginDemo } = useAuth()
  const { showToast } = useApp()

  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('+224 ')
  const [otp, setOtp] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpToken, setOtpToken] = useState(null)

  const cleanPhone = phone.replace(/\s/g, '')

  const handleSendOTP = async () => {
    if (cleanPhone.length < 12) {
      showToast('Numéro invalide. Format: +224 6XX XXX XXX', 'error')
      return
    }
    setLoading(true)
    try {
      await requestOTP(cleanPhone)
      showToast(DEMO_MODE ? 'OTP envoyé ! (Démo: utilisez 1234)' : 'OTP envoyé par SMS', 'success')
      setStep(1)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 4) { showToast('Entrez le code à 4 chiffres', 'error'); return }
    setLoading(true)
    try {
      const res = await confirmOTP(cleanPhone, otp)
      setOtpToken(res.token)
      if (res.isNew) { setIsNew(true); setStep(2) }
      else {
        // Existing user → go to PIN login
        setStep(2)
      }
      showToast('Téléphone vérifié !', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePIN = async () => {
    if (pin.length < 4) { showToast('PIN doit faire 4 chiffres', 'error'); return }
    if (isNew && pin !== pinConfirm) { showToast('Les PINs ne correspondent pas', 'error'); return }
    setLoading(true)
    try {
      if (isNew) await createPin(cleanPhone, pin, otpToken)
      const user = await login(cleanPhone, pin, defaultRole)
      showToast(`Bienvenue ${user.name || ''} !`, 'success')
      onSuccess(user)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const user = loginDemo(defaultRole)
    showToast(`Connexion démo: ${user.name}`, 'success')
    onSuccess(user)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={onBack} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Connexion</span>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Steps steps={STEPS} current={step} />
      </div>

      <div className="flex-1 px-6 pt-4 space-y-6">
        {/* Step 0 — Téléphone */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white text-2xl font-bold mb-1">Votre numéro</h2>
              <p className="text-gray-400 text-sm">Nous vous enverrons un code de vérification</p>
            </div>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+224 620 000 000"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-4 text-base focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            {DEMO_MODE && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-400">
                <strong>Mode Démo</strong> — Utilisez n'importe quel numéro +224. OTP = <strong>1234</strong>
              </div>
            )}
          </div>
        )}

        {/* Step 1 — OTP */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white text-2xl font-bold mb-1">Code de vérification</h2>
              <p className="text-gray-400 text-sm">Entrez le code envoyé au {phone}</p>
            </div>
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 4))}
              placeholder="1234"
              className="w-full bg-gray-800 border border-gray-700 text-white text-center text-3xl font-bold tracking-widest rounded-2xl py-4 px-4 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button onClick={() => setStep(0)} className="text-gray-400 text-sm underline">
              Changer le numéro
            </button>
          </div>
        )}

        {/* Step 2 — PIN */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white text-2xl font-bold mb-1">
                {isNew ? 'Créer votre PIN' : 'Votre PIN'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isNew ? 'Ce code sécurise votre compte' : 'Entrez votre code PIN à 4 chiffres'}
              </p>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPin ? 'number' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value.slice(0, 4))}
                placeholder="••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-12 text-xl text-center tracking-widest focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isNew && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.slice(0, 4))}
                  placeholder="Confirmer le PIN"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-2xl py-4 pl-12 pr-4 text-xl text-center tracking-widest focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            )}
            {DEMO_MODE && (
              <p className="text-yellow-400 text-xs text-center">
                Mode Démo — PIN par défaut: <strong>1234</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 space-y-3">
        <button
          onClick={step === 0 ? handleSendOTP : step === 1 ? handleVerifyOTP : handlePIN}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:text-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
        >
          {loading ? <Loader size={20} className="animate-spin" /> : null}
          {step === 0 ? 'Envoyer le code' : step === 1 ? 'Vérifier' : isNew ? 'Créer le PIN' : 'Se connecter'}
        </button>

        {DEMO_MODE && (
          <button
            onClick={handleDemoLogin}
            className="w-full bg-gray-800 hover:bg-gray-700 text-yellow-400 font-semibold py-4 rounded-2xl border border-yellow-500/30 transition-all"
          >
            ⚡ Accès démo rapide
          </button>
        )}
      </div>
    </div>
  )
}
