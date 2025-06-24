import { omdbApi } from './api'

class OMDBService {
  // Get movie details by IMDB ID
  async getMovieByImdbId(imdbId) {
    try {
      const response = await omdbApi.get('/', {
        params: { i: imdbId }
      })
      
      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found')
      }
      
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch movie from OMDB')
    }
  }

  // Search movies by title
  async searchMovies(title, year = null, page = 1) {
    try {
      const params = { s: title, page }
      if (year) params.y = year

      const response = await omdbApi.get('/', { params })
      
      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'No movies found')
      }
      
      return response.data
    } catch (error) {
      throw new Error('Failed to search movies in OMDB')
    }
  }

  // Get detailed movie info by title
  async getMovieByTitle(title, year = null) {
    try {
      const params = { t: title, plot: 'full' }
      if (year) params.y = year

      const response = await omdbApi.get('/', { params })
      
      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found')
      }
      
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch movie details from OMDB')
    }
  }

  // Extract additional ratings (IMDB, Rotten Tomatoes, Metacritic)
  extractRatings(omdbData) {
    const ratings = {
      imdb: null,
      rottenTomatoes: null,
      metacritic: null
    }

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

    return ratings
  }

  // Get enhanced movie data combining TMDB and OMDB
  async getEnhancedMovieData(tmdbMovie) {
    try {
      if (!tmdbMovie.imdb_id) {
        return { ...tmdbMovie, omdbData: null }
      }

      const omdbData = await this.getMovieByImdbId(tmdbMovie.imdb_id)
      const additionalRatings = this.extractRatings(omdbData)

      return {
        ...tmdbMovie,
        omdbData,
        additionalRatings,
        enhancedPlot: omdbData.Plot !== 'N/A' ? omdbData.Plot : tmdbMovie.overview,
        awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : null,
        boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : null
      }
    } catch (error) {
      console.warn('Failed to enhance movie data with OMDB:', error.message)
      return { ...tmdbMovie, omdbData: null }
    }
  }
}

export default new OMDBService()
