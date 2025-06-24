import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-300 px-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Oops! Something went wrong
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We encountered an unexpected error. Please try refreshing the page.
                  </p>
                </div>

                <button
                  onClick={this.handleRetry}
                  className="btn-primary flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left w-full">
                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Error Details (Development)
                    </summary>
                    <div className="bg-gray-100 dark:bg-dark-200 p-3 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </div>
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
