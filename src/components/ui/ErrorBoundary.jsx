import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }

    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    // In a real app, you'd send this to your error reporting service
    console.log('Error Report:', errorReport)
    
    // For demo, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error report copied to clipboard'))
      .catch(() => alert('Failed to copy error report'))
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props
      
      // Custom fallback component
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error}
            retry={this.handleRetry}
            retryCount={this.state.retryCount}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-dark-100 rounded-lg shadow-lg p-6 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {/* Error Details (Development) */}
            {showDetails && this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Error Details:
                </h3>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Retry attempts: {this.state.retryCount}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                <Bug className="w-4 h-4" />
                <span>Report Error</span>
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              If this problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for hooks
export const ErrorBoundaryWrapper = ({ children, fallback, showDetails }) => {
  return (
    <ErrorBoundary fallback={fallback} showDetails={showDetails}>
      {children}
    </ErrorBoundary>
  )
}

// Specific error fallbacks
export const MovieCardErrorFallback = ({ retry }) => (
  <div className="w-40 aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
    <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
      Failed to load
    </p>
    <button
      onClick={retry}
      className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
    >
      Retry
    </button>
  </div>
)

export const SectionErrorFallback = ({ error, retry, title = "Section" }) => (
  <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <div className="text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title} Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This section failed to load properly.
      </p>
      <button
        onClick={retry}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

export default ErrorBoundary
