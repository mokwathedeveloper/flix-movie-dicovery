import React, { useState } from 'react'
import { Filter, X, Calendar, Star, Clock } from 'lucide-react'

const AdvancedFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  className = '',
  isOpen = false,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState({
    yearRange: { min: 1900, max: new Date().getFullYear() + 2 },
    ratingRange: { min: 0, max: 10 },
    runtimeRange: { min: 0, max: 300 },
    sortBy: 'popularity.desc',
    ...filters
  })

  const currentYear = new Date().getFullYear()

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleRangeChange = (rangeKey, minMax, value) => {
    const newRange = { ...localFilters[rangeKey], [minMax]: parseInt(value) }
    handleFilterChange(rangeKey, newRange)
  }

  const resetFilters = () => {
    const defaultFilters = {
      yearRange: { min: 1900, max: currentYear + 2 },
      ratingRange: { min: 0, max: 10 },
      runtimeRange: { min: 0, max: 300 },
      sortBy: 'popularity.desc'
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = () => {
    return localFilters.yearRange.min !== 1900 ||
           localFilters.yearRange.max !== currentYear + 2 ||
           localFilters.ratingRange.min !== 0 ||
           localFilters.ratingRange.max !== 10 ||
           localFilters.runtimeRange.min !== 0 ||
           localFilters.runtimeRange.max !== 300 ||
           localFilters.sortBy !== 'popularity.desc'
  }

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'A-Z' },
    { value: 'title.desc', label: 'Z-A' }
  ]

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${hasActiveFilters()
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
          }
          ${className}
        `}
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Advanced Filters</span>
        {hasActiveFilters() && (
          <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            !
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={`bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Advanced Filters
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Reset All
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full input-field"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Release Year
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input
                type="number"
                min="1900"
                max={currentYear + 2}
                value={localFilters.yearRange.min}
                onChange={(e) => handleRangeChange('yearRange', 'min', e.target.value)}
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <input
                type="number"
                min="1900"
                max={currentYear + 2}
                value={localFilters.yearRange.max}
                onChange={(e) => handleRangeChange('yearRange', 'max', e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>
          <div className="mt-2">
            <input
              type="range"
              min="1900"
              max={currentYear + 2}
              value={localFilters.yearRange.min}
              onChange={(e) => handleRangeChange('yearRange', 'min', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Rating Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Star className="w-4 h-4 inline mr-1" />
            Rating (0-10)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={localFilters.ratingRange.min}
                onChange={(e) => handleRangeChange('ratingRange', 'min', e.target.value)}
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={localFilters.ratingRange.max}
                onChange={(e) => handleRangeChange('ratingRange', 'max', e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {localFilters.ratingRange.min} - {localFilters.ratingRange.max} stars
          </div>
        </div>

        {/* Runtime Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Runtime (minutes)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
              <input
                type="number"
                min="0"
                max="500"
                value={localFilters.runtimeRange.min}
                onChange={(e) => handleRangeChange('runtimeRange', 'min', e.target.value)}
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
              <input
                type="number"
                min="0"
                max="500"
                value={localFilters.runtimeRange.max}
                onChange={(e) => handleRangeChange('runtimeRange', 'max', e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {Math.floor(localFilters.runtimeRange.min / 60)}h {localFilters.runtimeRange.min % 60}m - {Math.floor(localFilters.runtimeRange.max / 60)}h {localFilters.runtimeRange.max % 60}m
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedFilters
