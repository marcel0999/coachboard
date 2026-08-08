import { Component } from 'react'
import Button from './Button'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[CoachBoard] Error de render:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/dashboard')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 text-center shadow-sm">
            <h1 className="text-lg font-bold text-text-primary">
              CoachBoard encontró un problema al cargar esta sección.
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Podés reintentar o volver al Dashboard. Si el problema continúa, cerrá sesión e ingresá
              nuevamente.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button type="button" onClick={this.handleRetry}>
                Reintentar
              </Button>
              <Button type="button" variant="secondary" onClick={this.handleGoDashboard}>
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
