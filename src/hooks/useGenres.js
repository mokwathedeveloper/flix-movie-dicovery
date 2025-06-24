import { useState, useEffect } from 'react'
import tmdbService from '../services/tmdbService'

const useGenres = () => {
  const [movieGenres, setMovieGenres] = useState([])
  const [tvGenres, setTVGenres] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [movieGenresResponse, tvGenresResponse] = await Promise.all([
          tmdbService.getMovieGenres(),
          tmdbService.getTVGenres()
        ])

        setMovieGenres(movieGenresResponse || [])
        setTVGenres(tvGenresResponse || [])
      } catch (err) {
        setError(err.message || 'Failed to fetch genres')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenres()
  }, [])

  // Get all unique genres (combining movie and TV genres)
  const getAllGenres = () => {
    const allGenres = [...movieGenres, ...tvGenres]
    const uniqueGenres = allGenres.filter((genre, index, self) => 
      index === self.findIndex(g => g.id === genre.id)
    )
    return uniqueGenres.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Get genre name by ID
  const getGenreName = (genreId) => {
    const allGenres = getAllGenres()
    const genre = allGenres.find(g => g.id === genreId)
    return genre ? genre.name : 'Unknown'
  }

  // Get multiple genre names by IDs
  const getGenreNames = (genreIds) => {
    return genreIds.map(id => getGenreName(id)).filter(Boolean)
  }

  return {
    movieGenres,
    tvGenres,
    allGenres: getAllGenres(),
    isLoading,
    error,
    getGenreName,
    getGenreNames
  }
}

export default useGenres
