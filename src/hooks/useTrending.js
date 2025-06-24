import { useState, useEffect } from 'react'
import tmdbService from '../services/tmdbService'

const useTrending = () => {
  const [data, setData] = useState({
    trending: [],
    popularMovies: [],
    popularTVShows: [],
    topRatedMovies: [],
    upcomingMovies: []
  })
  const [loading, setLoading] = useState({
    trending: true,
    popularMovies: true,
    popularTVShows: true,
    topRatedMovies: true,
    upcomingMovies: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchAllData = async () => {
      const fetchFunctions = [
        { key: 'trending', fn: () => tmdbService.getTrending('all', 'day') },
        { key: 'popularMovies', fn: () => tmdbService.getPopularMovies() },
        { key: 'popularTVShows', fn: () => tmdbService.getPopularTVShows() },
        { key: 'topRatedMovies', fn: () => tmdbService.getTopRatedMovies() },
        { key: 'upcomingMovies', fn: () => tmdbService.getUpcomingMovies() }
      ]

      // Fetch all data concurrently
      const promises = fetchFunctions.map(async ({ key, fn }) => {
        try {
          const response = await fn()
          return { key, data: response.results || [], error: null }
        } catch (error) {
          console.error(`Error fetching ${key}:`, error)
          return { key, data: [], error: error.message }
        }
      })

      const results = await Promise.all(promises)

      // Update state with results
      const newData = {}
      const newLoading = {}
      const newErrors = {}

      results.forEach(({ key, data, error }) => {
        newData[key] = data
        newLoading[key] = false
        if (error) {
          newErrors[key] = error
        }
      })

      setData(prevData => ({ ...prevData, ...newData }))
      setLoading(prevLoading => ({ ...prevLoading, ...newLoading }))
      setErrors(newErrors)
    }

    fetchAllData()
  }, [])

  // Retry function for failed requests
  const retry = async (section) => {
    setLoading(prev => ({ ...prev, [section]: true }))
    setErrors(prev => ({ ...prev, [section]: null }))

    try {
      let response
      switch (section) {
        case 'trending':
          response = await tmdbService.getTrending('all', 'day')
          break
        case 'popularMovies':
          response = await tmdbService.getPopularMovies()
          break
        case 'popularTVShows':
          response = await tmdbService.getPopularTVShows()
          break
        case 'topRatedMovies':
          response = await tmdbService.getTopRatedMovies()
          break
        case 'upcomingMovies':
          response = await tmdbService.getUpcomingMovies()
          break
        default:
          throw new Error('Invalid section')
      }

      setData(prev => ({ ...prev, [section]: response.results || [] }))
    } catch (error) {
      setErrors(prev => ({ ...prev, [section]: error.message }))
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }))
    }
  }

  // Check if any section is still loading
  const isAnyLoading = Object.values(loading).some(Boolean)

  // Check if all sections have errors
  const hasAllErrors = Object.keys(data).every(key => errors[key])

  return {
    data,
    loading,
    errors,
    retry,
    isAnyLoading,
    hasAllErrors
  }
}

export default useTrending
