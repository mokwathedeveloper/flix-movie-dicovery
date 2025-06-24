class CacheService {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${url}${sortedParams ? '?' + sortedParams : ''}`
  }

  // Set cache with TTL
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + ttl)
  }

  // Get from cache if not expired
  get(key) {
    const expiry = this.cacheExpiry.get(key)
    
    if (!expiry || Date.now() > expiry) {
      // Cache expired, remove it
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  // Check if key exists and is not expired
  has(key) {
    return this.get(key) !== null
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Cached API call wrapper
  async cachedFetch(url, options = {}, ttl = this.defaultTTL) {
    const cacheKey = this.generateKey(url, options.params)
    
    // Check cache first
    const cachedData = this.get(cacheKey)
    if (cachedData) {
      console.log('Cache hit:', cacheKey)
      return cachedData
    }

    try {
      // Make API call
      console.log('Cache miss, fetching:', cacheKey)
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache the response
      this.set(cacheKey, data, ttl)
      
      return data
    } catch (error) {
      console.error('Cached fetch error:', error)
      throw error
    }
  }
}

// Create singleton instance
const cacheService = new CacheService()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cacheService.cleanup()
}, 5 * 60 * 1000)

export default cacheService
