// Custom error classes for the application

export class NavigateError extends Error {
  constructor(message, code = 'NAVIGATE_ERROR') {
    super(message)
    this.name = 'NavigateError'
    this.code = code
  }
}

export class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.endpoint = endpoint
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter) {
    super('Rate limit exceeded', 429)
    this.retryAfter = retryAfter
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}
