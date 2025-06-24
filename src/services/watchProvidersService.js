import { tmdbApi } from './api'

class WatchProvidersService {
  // Get watch providers for a movie
  async getMovieWatchProviders(movieId, region = 'US') {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`)
      return response.data.results[region] || null
    } catch (error) {
      console.error('Failed to fetch movie watch providers:', error)
      return null
    }
  }

  // Get watch providers for a TV show
  async getTVWatchProviders(tvId, region = 'US') {
    try {
      const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`)
      return response.data.results[region] || null
    } catch (error) {
      console.error('Failed to fetch TV watch providers:', error)
      return null
    }
  }

  // Get available regions
  async getAvailableRegions() {
    try {
      const response = await tmdbApi.get('/watch/providers/regions')
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch available regions:', error)
      return []
    }
  }

  // Get all movie providers
  async getMovieProviders(region = 'US') {
    try {
      const response = await tmdbApi.get('/watch/providers/movie', {
        params: { watch_region: region }
      })
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch movie providers:', error)
      return []
    }
  }

  // Get all TV providers
  async getTVProviders(region = 'US') {
    try {
      const response = await tmdbApi.get('/watch/providers/tv', {
        params: { watch_region: region }
      })
      return response.data.results || []
    } catch (error) {
      console.error('Failed to fetch TV providers:', error)
      return []
    }
  }

  // Discover movies by watch provider
  async discoverMoviesByProvider(providerId, region = 'US', page = 1) {
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_watch_providers: providerId,
          watch_region: region,
          page
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to discover movies by provider:', error)
      return { results: [], total_pages: 0, total_results: 0 }
    }
  }

  // Discover TV shows by watch provider
  async discoverTVByProvider(providerId, region = 'US', page = 1) {
    try {
      const response = await tmdbApi.get('/discover/tv', {
        params: {
          with_watch_providers: providerId,
          watch_region: region,
          page
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to discover TV shows by provider:', error)
      return { results: [], total_pages: 0, total_results: 0 }
    }
  }

  // Format provider data for display
  formatProviderData(providers) {
    if (!providers) return null

    const formatted = {
      link: providers.link || null,
      flatrate: providers.flatrate || [],
      rent: providers.rent || [],
      buy: providers.buy || []
    }

    // Sort providers by display priority (most popular first)
    const sortProviders = (providerList) => {
      const priorityOrder = {
        'Netflix': 1,
        'Amazon Prime Video': 2,
        'Disney Plus': 3,
        'Hulu': 4,
        'HBO Max': 5,
        'Apple TV Plus': 6,
        'Paramount Plus': 7,
        'Peacock': 8,
        'Crunchyroll': 9,
        'YouTube Premium': 10
      }

      return providerList.sort((a, b) => {
        const priorityA = priorityOrder[a.provider_name] || 999
        const priorityB = priorityOrder[b.provider_name] || 999
        return priorityA - priorityB
      })
    }

    formatted.flatrate = sortProviders(formatted.flatrate)
    formatted.rent = sortProviders(formatted.rent)
    formatted.buy = sortProviders(formatted.buy)

    return formatted
  }

  // Get provider logo URL
  getProviderLogoUrl(logoPath, size = 'original') {
    if (!logoPath) return null
    return `https://image.tmdb.org/t/p/${size}${logoPath}`
  }

  // Check if content is available on specific provider
  isAvailableOnProvider(providers, providerName) {
    if (!providers) return false

    const allProviders = [
      ...(providers.flatrate || []),
      ...(providers.rent || []),
      ...(providers.buy || [])
    ]

    return allProviders.some(provider => 
      provider.provider_name.toLowerCase().includes(providerName.toLowerCase())
    )
  }

  // Get streaming availability summary
  getAvailabilitySummary(providers) {
    if (!providers) {
      return {
        hasStreaming: false,
        hasRental: false,
        hasPurchase: false,
        totalOptions: 0
      }
    }

    return {
      hasStreaming: (providers.flatrate || []).length > 0,
      hasRental: (providers.rent || []).length > 0,
      hasPurchase: (providers.buy || []).length > 0,
      totalOptions: (providers.flatrate || []).length + 
                   (providers.rent || []).length + 
                   (providers.buy || []).length
    }
  }
}

export default new WatchProvidersService()
