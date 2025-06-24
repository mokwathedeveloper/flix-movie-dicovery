import React, { useState, useRef, useEffect } from 'react'
import { Filter, X, ChevronDown, Search } from 'lucide-react'
import useGenres from '../../hooks/useGenres'

const GenreFilter = ({
  selectedGenres = [],
  onGenreChange,
  mediaType = 'all', // 'all', 'movie', 'tv'
  className = '',
  showLabel = true
}) => {
  const { movieGenres, tvGenres, allGenres, isLoading } = useGenres()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Get genres based on media type
  const getGenres = () => {
    switch (mediaType) {
      case 'movie':
        return movieGenres
      case 'tv':
        return tvGenres
      case 'all':
      default:
        return allGenres
    }
  }

  const genres = getGenres()

  // Filter genres based on search term
  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGenreToggle = (genreId) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId]

    onGenreChange(newSelectedGenres)
  }

  const clearAllGenres = () => {
    onGenreChange([])
    setSearchTerm('')
  }

  const getSelectedGenreNames = () => {
    return selectedGenres
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-32"></div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearchTerm('')
        }}
        className={`
          flex items-center justify-between space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 min-w-[100px] text-sm
          ${isOpen || selectedGenres.length > 0
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 flex-shrink-0" />
          {showLabel && (
            <span className="font-medium">
              {selectedGenres.length > 0
                ? `${selectedGenres.length} Genre${selectedGenres.length > 1 ? 's' : ''}`
                : 'Genres'
              }
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Genres Pills */}
      {selectedGenres.length > 0 && !isOpen && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {getSelectedGenreNames().slice(0, 2).map((genreName, index) => (
            <span
              key={selectedGenres[index]}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium border border-primary-200 dark:border-primary-800"
            >
              <span>{genreName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleGenreToggle(selectedGenres[index])
                }}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${genreName} filter`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {selectedGenres.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
              +{selectedGenres.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 w-80 max-w-[90vw]">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-dark-100 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Genre List */}
          <div className="max-h-48 overflow-y-auto">
            <div className="p-1">
              {filteredGenres.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                  {filteredGenres.map((genre) => (
                    <label
                      key={genre.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-dark-100 rounded cursor-pointer transition-colors group text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => handleGenreToggle(genre.id)}
                        className="w-3 h-3 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-1"
                      />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors truncate">
                        {genre.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No genres found</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {selectedGenres.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-dark-100 rounded-b-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedGenres.length} selected
                </span>
                <button
                  onClick={clearAllGenres}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// Compact version for smaller spaces
export const GenreFilterCompact = ({ selectedGenres = [], onGenreChange, mediaType = 'all' }) => {
  return (
    <GenreFilter
      selectedGenres={selectedGenres}
      onGenreChange={onGenreChange}
      mediaType={mediaType}
      showLabel={false}
      className="w-auto"
    />
  )
}

// Inline version that shows selected genres as tags
export const GenreFilterInline = ({ selectedGenres = [], onGenreChange, mediaType = 'all', maxVisible = 5 }) => {
  const { movieGenres, tvGenres, allGenres } = useGenres()

  const getGenres = () => {
    switch (mediaType) {
      case 'movie': return movieGenres
      case 'tv': return tvGenres
      default: return allGenres
    }
  }

  const genres = getGenres()
  const getSelectedGenreNames = () => {
    return selectedGenres
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean)
  }

  const handleRemoveGenre = (genreId) => {
    onGenreChange(selectedGenres.filter(id => id !== genreId))
  }

  const selectedNames = getSelectedGenreNames()

  if (selectedGenres.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Filtered by:</span>
      {selectedNames.slice(0, maxVisible).map((genreName, index) => (
        <span
          key={selectedGenres[index]}
          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800"
        >
          <span>{genreName}</span>
          <button
            onClick={() => handleRemoveGenre(selectedGenres[index])}
            className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${genreName} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {selectedNames.length > maxVisible && (
        <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
          +{selectedNames.length - maxVisible} more
        </span>
      )}
      {selectedGenres.length > 1 && (
        <button
          onClick={() => onGenreChange([])}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline transition-colors ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export default GenreFilter
