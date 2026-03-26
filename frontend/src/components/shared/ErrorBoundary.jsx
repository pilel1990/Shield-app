import { Component } from 'react'
import { Shield, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    // Recharger la page en dernier recours
    if (window.location.reload) window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-20 h-20 bg-red-900/30 border border-red-500/30 rounded-3xl flex items-center justify-center">
          <Shield size={36} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-white text-2xl font-bold">Oups, une erreur</h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Une erreur inattendue s'est produite. Veuillez recharger l'application.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs text-red-400 bg-gray-800 rounded-xl p-3 mt-3 overflow-x-auto max-w-sm">
              {this.state.error.message}
            </pre>
          )}
        </div>
        <button
          onClick={this.handleReset}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all"
        >
          <RefreshCw size={18} />
          Recharger l'application
        </button>
      </div>
    )
  }
}
