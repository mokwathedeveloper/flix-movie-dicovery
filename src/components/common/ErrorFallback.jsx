import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { parseError, getUserFriendlyMessage, isRetryableError } from '../../utils/errorHandling'

const ErrorFallback = ({ 
  error, 
  resetError, 
  title = "Something went wrong",
  showHomeButton = true,
  showBackButton = false,
  className = ""
}) => {
  const navigate = useNavigate()
  const parsedError = parseError(error)
  const canRetry = isRetryableError(parsedError)

  const handleGoHome = () => {
    navigate('/')
    if (resetError) resetError()
  }

  const handleGoBack = () => {
    navigate(-1)
    if (resetError) resetError()
  }

  const handleRetry = () => {
    if (resetError) resetError()
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center px-4 ${className}`}>
      <div className="max-w-md w-full text-center">
        <div className="card">
          <div className="flex flex-col items-center space-y-4">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            {/* Error Title */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {getUserFriendlyMessage(parsedError)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {canRetry && resetError && (
                <button
                  onClick={handleRetry}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
              
              {showBackButton && (
                <button
                  onClick={handleGoBack}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              )}
              
              {showHomeButton && (
                <button
                  onClick={handleGoHome}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
              )}
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-left w-full">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 dark:bg-dark-200 p-3 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Type:</strong> {parsedError.type}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message || 'No message'}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific error fallbacks for different scenarios
export const NetworkErrorFallback = ({ resetError }) => (
  <ErrorFallback
    error={{ type: 'NETWORK_ERROR', message: 'Network connection failed' }}
    resetError={resetError}
    title="Connection Problem"
    showBackButton={false}
  />
)

export const NotFoundErrorFallback = ({ resetError }) => (
  <ErrorFallback
    error={{ type: 'NOT_FOUND', message: 'The page you are looking for does not exist' }}
    resetError={resetError}
    title="Page Not Found"
    showBackButton={true}
  />
)

export const APIErrorFallback = ({ resetError }) => (
  <ErrorFallback
    error={{ type: 'API_ERROR', message: 'Service temporarily unavailable' }}
    resetError={resetError}
    title="Service Unavailable"
    showBackButton={false}
  />
)

export default ErrorFallback
