import { useState, useEffect } from 'react'
import { Shield, Copy, CheckCircle, ExternalLink, Download } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const LIVE_URL = 'https://pilel1990.github.io/shield-app/'

// Génère une URL QR via l'API QR publique (pas de clé requise)
const QR_API = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(LIVE_URL)}&bgcolor=111827&color=DC2626&margin=16&qzone=1&format=svg`

export default function QRCodePage({ onClose }) {
  const { showToast } = useApp()
  const [copied, setCopied] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LIVE_URL)
      setCopied(true)
      showToast('URL copiée !', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Copie non supportée', 'error')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShieldApp — Sécurité à la demande',
          text: 'Trouvez un agent de sécurité certifié à Conakry en quelques minutes.',
          url: LIVE_URL,
        })
      } catch {}
    } else {
      handleCopy()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">ShieldApp</span>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Titre */}
        <div className="text-center space-y-2">
          <h1 className="text-white text-2xl font-extrabold">Partager l'app</h1>
          <p className="text-gray-400 text-sm">Scannez le QR code ou partagez le lien</p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-800 rounded-3xl p-5 border border-gray-700/50 shadow-2xl">
          <div className="w-56 h-56 bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* QR généré via API publique */}
            <img
              src={QR_API}
              alt="QR Code ShieldApp"
              className={`w-full h-full object-contain transition-opacity duration-300 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setQrLoaded(true)}
              onError={() => setQrLoaded(true)}
            />
            {!qrLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Fallback QR manuel si API indisponible */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Live — GitHub Pages</span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div className="w-full bg-gray-800 rounded-2xl border border-gray-700 p-4">
          <p className="text-gray-400 text-xs mb-1">URL de l'application</p>
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-mono flex-1 truncate">{LIVE_URL}</p>
            <button onClick={handleCopy} className="flex-shrink-0 text-gray-400 hover:text-white transition-colors">
              {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Stats démo */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: 'Agents démo', value: '6', icon: '🛡️' },
            { label: 'Flows testables', value: '8', icon: '✅' },
            { label: 'Gratuit', value: '100%', icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-white font-bold text-base">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-10 space-y-3">
        <button onClick={handleShare}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
          <ExternalLink size={20} />
          Partager l'application
        </button>
        <button onClick={handleCopy}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-2xl border border-gray-700 flex items-center justify-center gap-2 transition-all">
          {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
          {copied ? 'Copié !' : 'Copier le lien'}
        </button>
      </div>
    </div>
  )
}
