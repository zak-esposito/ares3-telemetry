import { Component, type ErrorInfo, type ReactNode } from 'react'
import ErrorBanner from './ErrorBanner'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render-time errors in the active view so a single bad component can't
 * blank the whole dashboard. Falls back to the standard ErrorBanner with a
 * reset action that clears the captured error and re-renders the children.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('View render error:', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorBanner
          message={this.state.error.message || 'Unexpected render fault.'}
          onRetry={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}
