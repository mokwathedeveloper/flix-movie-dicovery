/**
 * Error handling utilities and helpers
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.API]: 'Service temporarily unavailable. Please try again later.',
  [ERROR_TYPES.VALIDATION]: 'Invalid input provided. Please check your data.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested content was not found.',
  [ERROR_TYPES.UNAUTHORIZED]: 'You are not authorized to access this content.',
  [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
}

/**
 * Parse error and return standardized error object
 * @param {Error|Object} error - The error to parse
 * @returns {Object} - Standardized error object
 */
export const parseError = (error) => {
  // Default error structure
  const defaultError = {
    type: ERROR_TYPES.UNKNOWN,
    message: ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
    originalError: error,
    timestamp: new Date().toISOString()
  }

  // Handle different error types
  if (!error) return defaultError

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      ...defaultError,
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES[ERROR_TYPES.NETWORK]
    }
  }

  // API errors with response
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 401:
        return {
          ...defaultError,
          type: ERROR_TYPES.UNAUTHORIZED,
          message: data?.message || ERROR_MESSAGES[ERROR_TYPES.UNAUTHORIZED]
        }
      case 404:
        return {
          ...defaultError,
          type: ERROR_TYPES.NOT_FOUND,
          message: data?.message || ERROR_MESSAGES[ERROR_TYPES.NOT_FOUND]
        }
      case 429:
        return {
          ...defaultError,
          type: ERROR_TYPES.RATE_LIMIT,
          message: data?.message || ERROR_MESSAGES[ERROR_TYPES.RATE_LIMIT]
        }
      case 400:
        return {
          ...defaultError,
          type: ERROR_TYPES.VALIDATION,
          message: data?.message || ERROR_MESSAGES[ERROR_TYPES.VALIDATION]
        }
      default:
        return {
          ...defaultError,
          type: ERROR_TYPES.API,
          message: data?.message || ERROR_MESSAGES[ERROR_TYPES.API]
        }
    }
  }

  // Custom error messages
  if (typeof error === 'string') {
    return {
      ...defaultError,
      message: error
    }
  }

  // Error objects with message
  if (error.message) {
    return {
      ...defaultError,
      message: error.message
    }
  }

  return defaultError
}

/**
 * Log error to console (and potentially external service)
 * @param {Object} error - Parsed error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  const errorLog = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog)
  }

  // In production, you might want to send this to an error tracking service
  // Example: Sentry, LogRocket, etc.
  // sendToErrorService(errorLog)
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with the function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff: delay = baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Create a safe async function that handles errors gracefully
 * @param {Function} fn - Async function to wrap
 * @param {Function} onError - Error handler function
 * @returns {Function} - Wrapped function
 */
export const createSafeAsyncFunction = (fn, onError = null) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const parsedError = parseError(error)
      logError(parsedError, { function: fn.name, arguments: args })
      
      if (onError) {
        onError(parsedError)
      }
      
      throw parsedError
    }
  }
}

/**
 * Check if error is retryable
 * @param {Object} error - Parsed error object
 * @returns {boolean} - Whether the error is retryable
 */
export const isRetryableError = (error) => {
  const retryableTypes = [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.API,
    ERROR_TYPES.RATE_LIMIT
  ]
  
  return retryableTypes.includes(error.type)
}

/**
 * Get user-friendly error message
 * @param {Object} error - Parsed error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  if (!error) return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]
  
  // Return custom message if available, otherwise use default for error type
  return error.message || ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]
}
