import { Component } from 'react'
import Button from './Button'

export default class ViewErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[CoachBoard] Error en vista:', error, info)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">
            {this.props.message ?? 'No se pudo cargar esta vista.'}
          </p>
          <p className="mt-2 text-sm text-red-700">
            Revisá los datos del jugador o intentá nuevamente.
          </p>
          {this.props.onRetry && (
            <Button className="mt-4" variant="secondary" size="sm" onClick={this.props.onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
