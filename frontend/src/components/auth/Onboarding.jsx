import { useState } from 'react'
import { Shield, Star, Clock, CreditCard, ChevronRight, ArrowRight } from 'lucide-react'
import { DEMO_MODE } from '../../constants/config'

const SLIDES = [
  {
    icon: <Shield size={64} className="text-red-500" />,
    title: 'Sécurité à la demande',
    subtitle: 'Trouvez un agent de sécurité certifié à Conakry en quelques minutes',
    bg: 'from-red-950/40 to-gray-900',
  },
  {
    icon: <Star size={64} className="text-yellow-400" />,
    title: 'Agents certifiés ONPSEC',
    subtitle: 'Tous nos agents sont vérifiés, badgés et expérimentés. Votre sécurité est notre priorité.',
    bg: 'from-yellow-950/40 to-gray-900',
  },
  {
    icon: <Clock size={64} className="text-blue-400" />,
    title: 'Disponible 24h/24',
    subtitle: 'Mission urgente ? Trouvez un agent disponible immédiatement, jour et nuit.',
    bg: 'from-blue-950/40 to-gray-900',
  },
  {
    icon: <CreditCard size={64} className="text-green-400" />,
    title: 'Paiement sécurisé',
    subtitle: 'Orange Money ou MTN MoMo. Vos fonds sont sécurisés jusqu\'à la fin de la mission.',
    bg: 'from-green-950/40 to-gray-900',
  },
]

export default function Onboarding({ onStart }) {
  const [slide, setSlide] = useState(0)

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1)
    else onStart()
  }

  const s = SLIDES[slide]

  return (
    <div className={`min-h-screen bg-gradient-to-b ${s.bg} flex flex-col`}>
      {/* Header logo */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">Shield<span className="text-red-500">App</span></span>
        </div>
        {DEMO_MODE && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full font-medium">
            MODE DÉMO
          </span>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
        <div className="w-32 h-32 bg-gray-800/60 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-700/50">
          {s.icon}
        </div>
        <div className="space-y-3">
          <h2 className="text-white text-3xl font-extrabold leading-tight">{s.title}</h2>
          <p className="text-gray-400 text-base leading-relaxed">{s.subtitle}</p>
        </div>
      </div>

      {/* Dots + Navigation */}
      <div className="px-6 pb-12 space-y-6">
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-8 h-2 bg-red-500' : 'w-2 h-2 bg-gray-600'}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-900/30"
        >
          {slide < SLIDES.length - 1 ? (
            <>Suivant <ChevronRight size={20} /></>
          ) : (
            <>Commencer <ArrowRight size={20} /></>
          )}
        </button>

        {slide === SLIDES.length - 1 && (
          <p className="text-center text-gray-600 text-xs">
            En continuant, vous acceptez nos{' '}
            <span className="text-gray-400 underline">Conditions d'utilisation</span>
          </p>
        )}
      </div>
    </div>
  )
}
