import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const ICONS = {
  success: <CheckCircle size={20} className="text-green-400" />,
  error: <XCircle size={20} className="text-red-400" />,
  warning: <AlertCircle size={20} className="text-yellow-400" />,
  info: <Info size={20} className="text-blue-400" />,
}

const BORDERS = {
  success: 'border-green-500/30 bg-green-900/20',
  error: 'border-red-500/30 bg-red-900/20',
  warning: 'border-yellow-500/30 bg-yellow-900/20',
  info: 'border-blue-500/30 bg-blue-900/20',
}

export default function Toast() {
  const { toast, hideToast } = useApp()

  if (!toast) return null

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl
          pointer-events-auto max-w-sm w-full
          ${BORDERS[toast.type] || BORDERS.info}
          bg-gray-900 backdrop-blur-sm animate-slide-down`}
        style={{ animation: 'slideDown 0.3s ease-out' }}
      >
        {ICONS[toast.type] || ICONS.info}
        <p className="text-white text-sm flex-1">{toast.message}</p>
        <button onClick={hideToast} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
