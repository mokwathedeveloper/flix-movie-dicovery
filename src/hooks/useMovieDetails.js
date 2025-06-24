import { useState, useEffect } from 'react'
import tmdbService from '../services/tmdbService'
import omdbService from '../services/omdbService'

const useMovieDetails = (id, mediaType = 'movie') => {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cast, setCast] = useState([])
  const [crew, setCrew] = useState([])
  const [videos, setVideos] = useState([])
  const [similar, setSimilar] = useState([])
  const [omdbData, setOmdbData] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        let movieDetails
        
        // Fetch details based on media type
        if (mediaType === 'tv') {
          movieDetails = await tmdbService.getTVShowDetails(id)
        } else {
          movieDetails = await tmdbService.getMovieDetails(id)
        }

        setDetails(movieDetails)

        // Extract cast and crew
        if (movieDetails.credits) {
          setCast(movieDetails.credits.cast?.slice(0, 20) || [])
          setCrew(movieDetails.credits.crew || [])
        }

        // Extract videos (trailers, teasers, etc.)
        if (movieDetails.videos) {
          const sortedVideos = movieDetails.videos.results
            ?.filter(video => video.site === 'YouTube')
            ?.sort((a, b) => {
              // Prioritize trailers and teasers
              const typeOrder = { 'Trailer': 1, 'Teaser': 2, 'Clip': 3, 'Featurette': 4 }
              return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5)
            }) || []
          setVideos(sortedVideos.slice(0, 6))
        }

        // Extract similar content
        if (movieDetails.similar) {
          setSimilar(movieDetails.similar.results?.slice(0, 12) || [])
        }

        // Fetch additional data from OMDB if it's a movie and has IMDB ID
        if (mediaType === 'movie' && movieDetails.imdb_id) {
          try {
            const enhancedData = await omdbService.getEnhancedMovieData(movieDetails)
            setOmdbData(enhancedData.omdbData)
          } catch (omdbError) {
            console.warn('Failed to fetch OMDB data:', omdbError)
          }
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [id, mediaType])

  // Get director(s)
  const directors = crew.filter(person => person.job === 'Director')

  // Get main cast (first 10)
  const mainCast = cast.slice(0, 10)

  // Get runtime formatted
  const getFormattedRuntime = () => {
    if (!details) return null
    
    if (mediaType === 'tv') {
      const episodeRuntime = details.episode_run_time?.[0]
      return episodeRuntime ? `${episodeRuntime} min/episode` : null
    } else {
      return details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : null
    }
  }

  // Get release info
  const getReleaseInfo = () => {
    if (!details) return null

    if (mediaType === 'tv') {
      const firstAirDate = details.first_air_date
      const lastAirDate = details.last_air_date
      const status = details.status

      if (firstAirDate) {
        const startYear = new Date(firstAirDate).getFullYear()
        const endYear = lastAirDate ? new Date(lastAirDate).getFullYear() : null
        
        if (status === 'Ended' && endYear && endYear !== startYear) {
          return `${startYear} - ${endYear}`
        } else if (status === 'Returning Series' || status === 'In Production') {
          return `${startYear} - Present`
        } else {
          return startYear.toString()
        }
      }
    } else {
      return details.release_date ? new Date(details.release_date).getFullYear() : null
    }
  }

  // Get genres
  const genres = details?.genres || []

  // Get production companies
  const productionCompanies = details?.production_companies?.slice(0, 3) || []

  // Get additional ratings from OMDB
  const getAdditionalRatings = () => {
    if (!omdbData) return null

    const ratings = {}
    
    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
      ratings.imdb = {
        score: omdbData.imdbRating,
        votes: omdbData.imdbVotes
      }
    }

    if (omdbData.Ratings) {
      omdbData.Ratings.forEach(rating => {
        if (rating.Source === 'Rotten Tomatoes') {
          ratings.rottenTomatoes = rating.Value
        } else if (rating.Source === 'Metacritic') {
          ratings.metacritic = rating.Value
        }
      })
    }

    return Object.keys(ratings).length > 0 ? ratings : null
  }

  return {
    details,
    isLoading,
    error,
    cast: mainCast,
    crew,
    directors,
    videos,
    similar,
    omdbData,
    genres,
    productionCompanies,
    formattedRuntime: getFormattedRuntime(),
    releaseInfo: getReleaseInfo(),
    additionalRatings: getAdditionalRatings()
  }
}

export default useMovieDetails
