import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { debounce } from '../../utils/debounce'

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search movies and TV shows...", 
  className = '',
  autoFocus = false,
  showClearButton = true,
  debounceDelay = 300,
  isLoading = false
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Create debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery) => {
      if (onSearch) {
        onSearch(searchQuery)
      }
    }, debounceDelay)
  ).current

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
    inputRef.current?.focus()
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Clear search on Escape
      if (e.key === 'Escape' && isFocused) {
        clearSearch()
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocused])

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center transition-all duration-200
        ${isFocused 
          ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-300' 
          : 'ring-1 ring-gray-300 dark:ring-gray-600'
        }
        rounded-lg bg-white dark:bg-dark-200 overflow-hidden
      `}>
        {/* Search Icon */}
        <div className="flex items-center justify-center w-12 h-12 text-gray-400 dark:text-gray-500">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            flex-1 h-12 px-0 py-3 text-gray-900 dark:text-gray-100 
            placeholder-gray-500 dark:placeholder-gray-400 
            bg-transparent border-0 focus:outline-none focus:ring-0
          "
        />

        {/* Clear Button */}
        {showClearButton && query && (
          <button
            onClick={clearSearch}
            className="
              flex items-center justify-center w-10 h-10 mr-1 
              text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
              rounded-md hover:bg-gray-100 dark:hover:bg-dark-100 
              transition-colors duration-200
            "
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!isFocused && !query && (
          <div className="hidden sm:flex items-center mr-3 text-xs text-gray-400 dark:text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-100 rounded border border-gray-300 dark:border-gray-600">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Search suggestions or recent searches could go here */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-200 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* This could be expanded to show search suggestions */}
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
            Press Enter to search for "{query}"
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
