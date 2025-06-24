import React, { useState, useEffect } from 'react'
import { Play, ShoppingCart, Tv, Globe, ExternalLink } from 'lucide-react'
import { getImageUrl } from '../../services/api'
import tmdbService from '../../services/tmdbService'

const StreamingProviders = ({ movieId, tvId, mediaType = 'movie' }) => {
  const [providers, setProviders] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('US')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const contentId = mediaType === 'movie' ? movieId : tvId

  useEffect(() => {
    if (contentId) {
      loadWatchProviders()
    }
  }, [contentId, mediaType])

  const loadWatchProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = mediaType === 'movie' 
        ? await tmdbService.getMovieWatchProviders(contentId)
        : await tmdbService.getTVWatchProviders(contentId)
      
      setProviders(data.results || {})
    } catch (err) {
      setError('Failed to load streaming information')
      console.error('Error loading watch providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const regions = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' }
  ]

  const ProviderSection = ({ title, providers, icon: Icon, color, description }) => {
    if (!providers || providers.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">({providers.length})</span>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {providers.map((provider) => (
            <div
              key={provider.provider_id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-700">
                <img
                  src={getImageUrl(provider.logo_path, 'w92')}
                  alt={provider.provider_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center line-clamp-2">
                {provider.provider_name}
              </h5>
              
              {provider.display_priority && (
                <div className="absolute top-1 right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {provider.display_priority}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tv className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Where to Watch
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  const regionData = providers[selectedRegion]

  if (!regionData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tv className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Where to Watch
            </h3>
          </div>
          
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            {regions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.flag} {region.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Not available for streaming in {regions.find(r => r.code === selectedRegion)?.name}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try selecting a different region above
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Tv className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Where to Watch
          </h3>
        </div>
        
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.flag} {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* JustWatch Attribution */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <span>Streaming data provided by JustWatch</span>
        <a
          href={regionData.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <span>View on JustWatch</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Streaming Options */}
      <div className="space-y-6">
        <ProviderSection
          title="Stream"
          providers={regionData.flatrate}
          icon={Play}
          color="text-green-600"
          description="Watch with subscription"
        />
        
        <ProviderSection
          title="Rent"
          providers={regionData.rent}
          icon={ShoppingCart}
          color="text-blue-600"
          description="Rent for a limited time"
        />
        
        <ProviderSection
          title="Buy"
          providers={regionData.buy}
          icon={ShoppingCart}
          color="text-purple-600"
          description="Purchase to own"
        />
      </div>

      {/* No Options Available */}
      {!regionData.flatrate?.length && !regionData.rent?.length && !regionData.buy?.length && (
        <div className="text-center py-8">
          <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No streaming options available in {regions.find(r => r.code === selectedRegion)?.name}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Check back later or try a different region
          </p>
        </div>
      )}
    </div>
  )
}

export default StreamingProviders
