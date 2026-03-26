import { Shield, ChevronLeft, Bell } from 'lucide-react'

export default function Header({ title, subtitle, onBack, actions, transparent }) {
  return (
    <header className={`sticky top-0 z-40 ${transparent ? '' : 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Shield</span>
              <span className="font-bold text-red-500 text-lg">App</span>
            </div>
          )}
          {(title || subtitle) && (
            <div>
              {title && <h1 className="text-white font-semibold text-base leading-tight">{title}</h1>}
              {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </header>
  )
}
