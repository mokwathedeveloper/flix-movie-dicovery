import axios from 'axios'

// API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY
const OMDB_BASE_URL = import.meta.env.VITE_OMDB_BASE_URL || 'http://www.omdbapi.com'

// Debug: Log API keys (remove in production)
console.log('TMDB API Key:', TMDB_API_KEY ? 'Present' : 'Missing')
console.log('OMDB API Key:', OMDB_API_KEY ? 'Present' : 'Missing')

// Create axios instances
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 10000,
})

const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
  params: {
    apikey: OMDB_API_KEY,
  },
  timeout: 10000,
})

// Request interceptors for error handling
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('TMDB API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

omdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('OMDB API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Utility functions
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg'
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export const formatReleaseDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Export API instances
export { tmdbApi, omdbApi }
