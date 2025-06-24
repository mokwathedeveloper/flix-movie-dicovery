import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Calendar, Plus, Check, Heart, Play } from 'lucide-react'
import { useWatchlist } from '../../context/WatchlistContext'
import { getImageUrl, formatReleaseDate } from '../../services/api'
import LazyImage from './LazyImage'

const MovieCard = ({
  movie,
  className = '',
  showWatchlistButton = true,
  showRating = true,
  showYear = true,
  size = 'md'
}) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  const isInList = isInWatchlist(movie.id, movie.media_type || 'movie')
  const title = movie.title || movie.name
  const releaseDate = movie.release_date || movie.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null
  const mediaType = movie.media_type || 'movie'

  const sizeClasses = {
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48'
  }

  const handleWatchlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInList) {
      removeFromWatchlist(movie.id, mediaType)
    } else {
      addToWatchlist({ ...movie, media_type: mediaType })
    }
  }



  return (
    <div className={`group relative ${sizeClasses[size]} ${className}`}>
      <Link 
        to={`/${mediaType}/${movie.id}`}
        className="block transition-transform duration-300 hover:scale-105"
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
          {/* Movie Poster with Lazy Loading */}
          <LazyImage
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={title}
            className="w-full h-full"
            fallback="/placeholder-movie.jpg"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white" />
          </div>

          {/* Rating Badge */}
          {showRating && movie.vote_average > 0 && (
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}

          {/* Watchlist Button */}
          {showWatchlistButton && (
            <button
              onClick={handleWatchlistToggle}
              className={`
                absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200
                ${isInList 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-black/50 text-white hover:bg-black/70'
                }
                opacity-0 group-hover:opacity-100 hover:scale-110
              `}
              aria-label={isInList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInList ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Media Type Badge */}
          {movie.media_type && (
            <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-md font-medium uppercase">
              {movie.media_type === 'tv' ? 'TV' : 'Movie'}
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          
          {showYear && year && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{year}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

// Compact horizontal card variant
export const MovieCardHorizontal = ({ movie, className = '' }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const isInList = isInWatchlist(movie.id, movie.media_type || 'movie')
  const title = movie.title || movie.name
  const releaseDate = movie.release_date || movie.first_air_date
  const mediaType = movie.media_type || 'movie'

  const handleWatchlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInList) {
      removeFromWatchlist(movie.id, mediaType)
    } else {
      addToWatchlist({ ...movie, media_type: mediaType })
    }
  }

  return (
    <div className={`flex space-x-4 p-4 bg-white dark:bg-dark-100 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <Link to={`/${mediaType}/${movie.id}`} className="flex-shrink-0">
        <img
          src={getImageUrl(movie.poster_path, 'w200')}
          alt={title}
          className="w-16 h-24 object-cover rounded-lg"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link to={`/${mediaType}/${movie.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formatReleaseDate(releaseDate)}
        </p>
        
        {movie.vote_average > 0 && (
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleWatchlistToggle}
        className={`
          flex-shrink-0 p-2 rounded-lg transition-colors
          ${isInList 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
        `}
      >
        {isInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default MovieCard
