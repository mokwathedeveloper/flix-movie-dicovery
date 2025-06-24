import React, { useState, useEffect } from 'react'
import { Play, ShoppingCart, DollarSign, ExternalLink, MapPin } from 'lucide-react'
import watchProvidersService from '../../services/watchProvidersService'

const WatchProviders = ({ 
  movieId, 
  mediaType = 'movie', 
  className = '',
  region = 'US' 
}) => {
  const [providers, setProviders] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(region)

  useEffect(() => {
    const fetchProviders = async () => {
      if (!movieId) return

      setIsLoading(true)
      setError(null)

      try {
        let providerData
        if (mediaType === 'tv') {
          providerData = await watchProvidersService.getTVWatchProviders(movieId, selectedRegion)
        } else {
          providerData = await watchProvidersService.getMovieWatchProviders(movieId, selectedRegion)
        }

        const formatted = watchProvidersService.formatProviderData(providerData)
        setProviders(formatted)
      } catch (err) {
        setError('Failed to load watch providers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [movieId, mediaType, selectedRegion])

  const availability = providers ? watchProvidersService.getAvailabilitySummary(providers) : null

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        {error}
      </div>
    )
  }

  if (!providers || availability.totalOptions === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Where to Watch</span>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Not currently available on major streaming platforms in {selectedRegion}.
        </p>
      </div>
    )
  }

  const ProviderSection = ({ title, providers: sectionProviders, icon: Icon, type }) => {
    if (!sectionProviders || sectionProviders.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
          <Icon className="w-4 h-4" />
          <span>{title}</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {sectionProviders.slice(0, 6).map((provider) => (
            <div
              key={provider.provider_id}
              className="group relative"
              title={provider.provider_name}
            >
              <img
                src={watchProvidersService.getProviderLogoUrl(provider.logo_path, 'w92')}
                alt={provider.provider_name}
                className="w-12 h-12 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {provider.provider_name}
              </div>
            </div>
          ))}
          {sectionProviders.length > 6 && (
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              +{sectionProviders.length - 6}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Play className="w-5 h-5" />
          <span>Where to Watch</span>
        </h3>
        
        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="space-y-4">
        <ProviderSection
          title="Stream"
          providers={providers.flatrate}
          icon={Play}
          type="stream"
        />
        
        <ProviderSection
          title="Rent"
          providers={providers.rent}
          icon={DollarSign}
          type="rent"
        />
        
        <ProviderSection
          title="Buy"
          providers={providers.buy}
          icon={ShoppingCart}
          type="buy"
        />
      </div>

      {/* Region Selector */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>Showing availability for {selectedRegion}</span>
        </div>
      </div>
    </div>
  )
}

// Compact version for movie cards
export const WatchProvidersCompact = ({ movieId, mediaType = 'movie', className = '' }) => {
  const [providers, setProviders] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      if (!movieId) return

      try {
        let providerData
        if (mediaType === 'tv') {
          providerData = await watchProvidersService.getTVWatchProviders(movieId)
        } else {
          providerData = await watchProvidersService.getMovieWatchProviders(movieId)
        }

        const formatted = watchProvidersService.formatProviderData(providerData)
        setProviders(formatted)
      } catch (err) {
        console.error('Failed to load providers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [movieId, mediaType])

  if (isLoading || !providers) return null

  const streamingProviders = providers.flatrate || []
  if (streamingProviders.length === 0) return null

  return (
    <div className={`flex space-x-1 ${className}`}>
      {streamingProviders.slice(0, 3).map((provider) => (
        <img
          key={provider.provider_id}
          src={watchProvidersService.getProviderLogoUrl(provider.logo_path, 'w45')}
          alt={provider.provider_name}
          className="w-6 h-6 rounded"
          title={provider.provider_name}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      ))}
      {streamingProviders.length > 3 && (
        <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
          +
        </div>
      )}
    </div>
  )
}

export default WatchProviders
