import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'

const WatchlistContext = createContext()

export const useWatchlist = () => {
  const context = useContext(WatchlistContext)
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}

// Watchlist item status
export const WATCHLIST_STATUS = {
  WANT_TO_WATCH: 'want_to_watch',
  WATCHING: 'watching',
  WATCHED: 'watched'
}

// Action types
const ACTIONS = {
  LOAD_WATCHLIST: 'LOAD_WATCHLIST',
  ADD_TO_WATCHLIST: 'ADD_TO_WATCHLIST',
  REMOVE_FROM_WATCHLIST: 'REMOVE_FROM_WATCHLIST',
  UPDATE_STATUS: 'UPDATE_STATUS',
  CLEAR_WATCHLIST: 'CLEAR_WATCHLIST'
}

// Reducer function
const watchlistReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_WATCHLIST:
      return action.payload

    case ACTIONS.ADD_TO_WATCHLIST:
      const newItem = {
        ...action.payload,
        addedAt: new Date().toISOString(),
        status: WATCHLIST_STATUS.WANT_TO_WATCH
      }
      return [...state, newItem]

    case ACTIONS.REMOVE_FROM_WATCHLIST:
      return state.filter(item => 
        !(item.id === action.payload.id && item.media_type === action.payload.media_type)
      )

    case ACTIONS.UPDATE_STATUS:
      return state.map(item =>
        item.id === action.payload.id && item.media_type === action.payload.media_type
          ? { ...item, status: action.payload.status, updatedAt: new Date().toISOString() }
          : item
      )

    case ACTIONS.CLEAR_WATCHLIST:
      return []

    default:
      return state
  }
}

export const WatchlistProvider = ({ children }) => {
  const [watchlist, dispatch] = useReducer(watchlistReducer, [])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = getFromStorage(STORAGE_KEYS.WATCHLIST, [])
    dispatch({ type: ACTIONS.LOAD_WATCHLIST, payload: savedWatchlist })
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    setToStorage(STORAGE_KEYS.WATCHLIST, watchlist)
  }, [watchlist])

  // Add item to watchlist
  const addToWatchlist = (item) => {
    const watchlistItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      release_date: item.release_date || item.first_air_date,
      vote_average: item.vote_average,
      media_type: item.media_type || 'movie',
      overview: item.overview
    }
    dispatch({ type: ACTIONS.ADD_TO_WATCHLIST, payload: watchlistItem })
  }

  // Remove item from watchlist
  const removeFromWatchlist = (id, mediaType = 'movie') => {
    dispatch({ 
      type: ACTIONS.REMOVE_FROM_WATCHLIST, 
      payload: { id, media_type: mediaType } 
    })
  }

  // Update item status
  const updateStatus = (id, status, mediaType = 'movie') => {
    dispatch({ 
      type: ACTIONS.UPDATE_STATUS, 
      payload: { id, status, media_type: mediaType } 
    })
  }

  // Clear entire watchlist
  const clearWatchlist = () => {
    dispatch({ type: ACTIONS.CLEAR_WATCHLIST })
  }

  // Check if item is in watchlist
  const isInWatchlist = (id, mediaType = 'movie') => {
    return watchlist.some(item => 
      item.id === id && item.media_type === mediaType
    )
  }

  // Get item from watchlist
  const getWatchlistItem = (id, mediaType = 'movie') => {
    return watchlist.find(item => 
      item.id === id && item.media_type === mediaType
    )
  }

  // Get watchlist by status
  const getWatchlistByStatus = (status) => {
    return watchlist.filter(item => item.status === status)
  }

  // Get watchlist statistics
  const getWatchlistStats = () => {
    return {
      total: watchlist.length,
      wantToWatch: watchlist.filter(item => item.status === WATCHLIST_STATUS.WANT_TO_WATCH).length,
      watching: watchlist.filter(item => item.status === WATCHLIST_STATUS.WATCHING).length,
      watched: watchlist.filter(item => item.status === WATCHLIST_STATUS.WATCHED).length
    }
  }

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    clearWatchlist,
    isInWatchlist,
    getWatchlistItem,
    getWatchlistByStatus,
    getWatchlistStats,
    WATCHLIST_STATUS
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}
