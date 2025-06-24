import React, { useState } from 'react'
import {
  Bookmark, Eye, Clock, Trash2, Filter, Grid, List,
  Calendar, Star, Play, AlertCircle, Download
} from 'lucide-react'
import { useWatchlist } from '../context/WatchlistContext'
import MovieCard, { MovieCardHorizontal } from '../components/ui/MovieCard'
import ExportWatchlist from '../components/ui/ExportWatchlist'
import { formatReleaseDate } from '../services/api'

const WatchlistPage = () => {
  const {
    watchlist,
    getWatchlistByStatus,
    getWatchlistStats,
    updateStatus,
    removeFromWatchlist,
    clearWatchlist,
    WATCHLIST_STATUS
  } = useWatchlist()

  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('added') // 'added', 'title', 'rating', 'release'
  const [showExport, setShowExport] = useState(false)

  const stats = getWatchlistStats()

  // Filter watchlist based on active tab
  const getFilteredWatchlist = () => {
    let filtered = activeTab === 'all' ? watchlist : getWatchlistByStatus(activeTab)

    // Sort the filtered list
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0)
        case 'release':
          const dateA = new Date(a.release_date || 0)
          const dateB = new Date(b.release_date || 0)
          return dateB - dateA
        case 'added':
        default:
          return new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
      }
    })
  }

  const filteredWatchlist = getFilteredWatchlist()

  const handleStatusChange = (id, mediaType, newStatus) => {
    updateStatus(id, newStatus, mediaType)
  }

  const handleRemove = (id, mediaType) => {
    removeFromWatchlist(id, mediaType)
  }

  const tabs = [
    { key: 'all', label: 'All', count: stats.total, icon: Bookmark },
    { key: WATCHLIST_STATUS.WANT_TO_WATCH, label: 'Want to Watch', count: stats.wantToWatch, icon: Clock },
    { key: WATCHLIST_STATUS.WATCHING, label: 'Watching', count: stats.watching, icon: Play },
    { key: WATCHLIST_STATUS.WATCHED, label: 'Watched', count: stats.watched, icon: Eye }
  ]

  const sortOptions = [
    { key: 'added', label: 'Date Added' },
    { key: 'title', label: 'Title' },
    { key: 'rating', label: 'Rating' },
    { key: 'release', label: 'Release Date' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Watchlist
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Keep track of movies and TV shows you want to watch
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <div
              key={tab.key}
              className={`
                card cursor-pointer transition-all duration-200 hover:shadow-lg
                ${activeTab === tab.key
                  ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-100'
                }
              `}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {tab.count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tab.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      {filteredWatchlist.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'all' && stats.total > 0 && (
              <>
                <ExportWatchlist
                  watchlist={watchlist}
                  isOpen={showExport}
                  onToggle={() => setShowExport(!showExport)}
                />

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
                      clearWatchlist()
                    }
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>

          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                p-2 transition-colors
                ${viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
                }
              `}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                p-2 transition-colors
                ${viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
                }
              `}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Watchlist Content */}
      {filteredWatchlist.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'all' ? (
              <Bookmark className="w-8 h-8 text-gray-400" />
            ) : activeTab === WATCHLIST_STATUS.WANT_TO_WATCH ? (
              <Clock className="w-8 h-8 text-gray-400" />
            ) : activeTab === WATCHLIST_STATUS.WATCHING ? (
              <Play className="w-8 h-8 text-gray-400" />
            ) : (
              <Eye className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {activeTab === 'all'
              ? 'Your watchlist is empty'
              : `No ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()} items`
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {activeTab === 'all'
              ? 'Start adding movies and TV shows to keep track of what you want to watch'
              : `You don't have any items marked as ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`
            }
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => window.location.href = '/search'}
              className="btn-primary"
            >
              Browse Content
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredWatchlist.map((item) => (
                <WatchlistMovieCard
                  key={`${item.id}-${item.media_type}`}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredWatchlist.map((item) => (
                <WatchlistMovieCardHorizontal
                  key={`${item.id}-${item.media_type}`}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Custom watchlist movie card with status controls
const WatchlistMovieCard = ({ item, onStatusChange, onRemove }) => {
  const [showControls, setShowControls] = useState(false)

  const statusOptions = [
    { value: 'want_to_watch', label: 'Want to Watch', icon: Clock },
    { value: 'watching', label: 'Watching', icon: Play },
    { value: 'watched', label: 'Watched', icon: Eye }
  ]

  const currentStatus = statusOptions.find(s => s.value === item.status)
  const StatusIcon = currentStatus?.icon || Clock

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <MovieCard
        movie={item}
        showWatchlistButton={false}
        size="md"
      />

      {/* Status Badge */}
      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
        <StatusIcon className="w-3 h-3 text-white" />
        <span className="text-white text-xs font-medium">
          {currentStatus?.label}
        </span>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col space-y-1 w-full px-4">
            {statusOptions.map((status) => {
              const Icon = status.icon
              return (
                <button
                  key={status.value}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onStatusChange(item.id, item.media_type, status.value)
                  }}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${item.status === status.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{status.label}</span>
                </button>
              )
            })}

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove(item.id, item.media_type)
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Horizontal card for list view
const WatchlistMovieCardHorizontal = ({ item, onStatusChange, onRemove }) => {
  const statusOptions = [
    { value: 'want_to_watch', label: 'Want to Watch', icon: Clock },
    { value: 'watching', label: 'Watching', icon: Play },
    { value: 'watched', label: 'Watched', icon: Eye }
  ]

  const currentStatus = statusOptions.find(s => s.value === item.status)

  return (
    <div className="card">
      <div className="flex space-x-4">
        <MovieCardHorizontal movie={item} className="flex-1 !p-0 !shadow-none !bg-transparent" />

        <div className="flex flex-col justify-between py-2">
          <div className="space-y-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium text-gray-700 dark:text-gray-300">{currentStatus?.label}</span>
            </div>

            {item.addedAt && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Added: {formatReleaseDate(item.addedAt)}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <select
              value={item.status}
              onChange={(e) => onStatusChange(item.id, item.media_type, e.target.value)}
              className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => onRemove(item.id, item.media_type)}
              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              aria-label="Remove from watchlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchlistPage
