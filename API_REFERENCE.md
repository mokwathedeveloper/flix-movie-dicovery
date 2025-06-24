# FLIX API Reference

## Overview

FLIX integrates with two primary external APIs to provide comprehensive movie and TV show data. This document outlines the API integration architecture, endpoint usage, and implementation details.

## The Movie Database (TMDB) API

### Base Configuration
- **Base URL**: `https://api.themoviedb.org/3`
- **Authentication**: Bearer token authentication
- **Rate Limiting**: 40 requests per 10 seconds
- **Documentation**: [TMDB API Documentation](https://developers.themoviedb.org/3)

### Core Endpoints

#### Search Operations
```
GET /search/multi
Parameters:
  - query (string, required): Search query
  - page (integer, optional): Page number (default: 1)
  - include_adult (boolean, optional): Include adult content
  - region (string, optional): ISO 3166-1 country code

Response: Paginated results with movies, TV shows, and people
```

```
GET /search/movie
Parameters:
  - query (string, required): Movie title search
  - page (integer, optional): Page number
  - year (integer, optional): Release year filter
  - primary_release_year (integer, optional): Primary release year

Response: Paginated movie results
```

```
GET /search/tv
Parameters:
  - query (string, required): TV show title search
  - page (integer, optional): Page number
  - first_air_date_year (integer, optional): First air date year

Response: Paginated TV show results
```

#### Content Discovery
```
GET /trending/{media_type}/{time_window}
Parameters:
  - media_type: all, movie, tv, person
  - time_window: day, week
  - page (integer, optional): Page number

Response: Trending content for specified time window
```

```
GET /movie/popular
GET /movie/top_rated
GET /movie/upcoming
GET /movie/now_playing
Parameters:
  - page (integer, optional): Page number
  - region (string, optional): Country code for regional results

Response: Paginated movie lists
```

```
GET /tv/popular
GET /tv/top_rated
GET /tv/on_the_air
GET /tv/airing_today
Parameters:
  - page (integer, optional): Page number

Response: Paginated TV show lists
```

#### Detailed Information
```
GET /movie/{movie_id}
Parameters:
  - append_to_response (string, optional): Additional data to include
    Available: credits, videos, similar, reviews, watch/providers

Response: Comprehensive movie details
```

```
GET /tv/{tv_id}
Parameters:
  - append_to_response (string, optional): Additional data to include
    Available: credits, videos, similar, reviews, watch/providers

Response: Comprehensive TV show details
```

```
GET /person/{person_id}
Parameters:
  - append_to_response (string, optional): Additional data to include
    Available: movie_credits, tv_credits, images

Response: Person details with filmography
```

#### Recommendations and Similar Content
```
GET /movie/{movie_id}/recommendations
GET /movie/{movie_id}/similar
GET /tv/{tv_id}/recommendations
GET /tv/{tv_id}/similar
Parameters:
  - page (integer, optional): Page number

Response: Paginated recommendation lists
```

#### Watch Providers
```
GET /movie/{movie_id}/watch/providers
GET /tv/{tv_id}/watch/providers

Response: Streaming availability by region
```

```
GET /watch/providers/movie
GET /watch/providers/tv
Parameters:
  - watch_region (string, optional): Country code

Response: Available streaming providers
```

#### Genre Information
```
GET /genre/movie/list
GET /genre/tv/list
Parameters:
  - language (string, optional): Language code

Response: Genre list with IDs and names
```

### Response Format Examples

#### Movie Object
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "A ticking-time-bomb insomniac...",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "backdrop_path": "/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
  "release_date": "1999-10-15",
  "vote_average": 8.433,
  "vote_count": 26280,
  "genre_ids": [18, 53, 35],
  "popularity": 61.416,
  "adult": false,
  "original_language": "en",
  "original_title": "Fight Club"
}
```

#### TV Show Object
```json
{
  "id": 1399,
  "name": "Game of Thrones",
  "overview": "Seven noble families fight...",
  "poster_path": "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  "backdrop_path": "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
  "first_air_date": "2011-04-17",
  "vote_average": 8.453,
  "vote_count": 22075,
  "genre_ids": [18, 10765, 10759],
  "popularity": 369.594,
  "origin_country": ["US"],
  "original_language": "en",
  "original_name": "Game of Thrones"
}
```

## Open Movie Database (OMDB) API

### Base Configuration
- **Base URL**: `http://www.omdbapi.com`
- **Authentication**: API key parameter
- **Rate Limiting**: 1000 requests per day (free tier)
- **Documentation**: [OMDB API Documentation](http://www.omdbapi.com/)

### Endpoints

#### Movie Details by IMDb ID
```
GET /?i={imdb_id}&apikey={api_key}
Parameters:
  - i (string, required): IMDb ID
  - plot (string, optional): short, full
  - r (string, optional): json, xml

Response: Detailed movie information with additional ratings
```

#### Search by Title
```
GET /?s={title}&apikey={api_key}
Parameters:
  - s (string, required): Movie title
  - y (integer, optional): Year of release
  - type (string, optional): movie, series, episode
  - page (integer, optional): Page number

Response: Search results with basic information
```

### Response Format Example
```json
{
  "Title": "Fight Club",
  "Year": "1999",
  "Rated": "R",
  "Released": "15 Oct 1999",
  "Runtime": "139 min",
  "Genre": "Drama",
  "Director": "David Fincher",
  "Writer": "Chuck Palahniuk, Jim Uhls",
  "Actors": "Brad Pitt, Edward Norton, Meat Loaf",
  "Plot": "An insomniac office worker...",
  "Language": "English",
  "Country": "United States",
  "Awards": "Nominated for 1 Oscar. 11 wins & 38 nominations total",
  "Poster": "https://m.media-amazon.com/images/M/...",
  "Ratings": [
    {
      "Source": "Internet Movie Database",
      "Value": "8.8/10"
    },
    {
      "Source": "Rotten Tomatoes",
      "Value": "79%"
    },
    {
      "Source": "Metacritic",
      "Value": "66/100"
    }
  ],
  "Metascore": "66",
  "imdbRating": "8.8",
  "imdbVotes": "2,084,331",
  "imdbID": "tt0137523",
  "Type": "movie",
  "DVD": "06 Jun 2000",
  "BoxOffice": "$37,030,102",
  "Production": "N/A",
  "Website": "N/A",
  "Response": "True"
}
```

## Service Layer Implementation

### TMDB Service Class
```javascript
class TMDBService {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3'
    this.apiKey = process.env.VITE_TMDB_API_KEY
    this.cache = new Map()
  }

  async request(endpoint, params = {}) {
    // Implementation with caching, error handling, retry logic
  }

  async searchMulti(query, page = 1) {
    return this.request('/search/multi', { query, page })
  }

  async getMovieDetails(movieId) {
    return this.request(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,similar,reviews'
    })
  }
}
```

### OMDB Service Class
```javascript
class OMDBService {
  constructor() {
    this.baseURL = 'http://www.omdbapi.com'
    this.apiKey = process.env.VITE_OMDB_API_KEY
  }

  async getMovieByImdbId(imdbId) {
    return this.request('/', { i: imdbId, plot: 'full' })
  }

  async searchMovies(title, year = null) {
    const params = { s: title, type: 'movie' }
    if (year) params.y = year
    return this.request('/', params)
  }
}
```

## Error Handling

### Error Types
```javascript
class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.endpoint = endpoint
  }
}

class RateLimitError extends APIError {
  constructor(retryAfter) {
    super('Rate limit exceeded', 429)
    this.retryAfter = retryAfter
  }
}
```

### Retry Logic
```javascript
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

## Caching Strategy

### Cache Configuration
```javascript
const CACHE_DURATIONS = {
  search: 5 * 60 * 1000,           // 5 minutes
  trending: 10 * 60 * 1000,        // 10 minutes
  popular: 30 * 60 * 1000,         // 30 minutes
  details: 60 * 60 * 1000,         // 1 hour
  genres: 24 * 60 * 60 * 1000,     // 24 hours
}
```

### Cache Implementation
```javascript
class CacheManager {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  set(key, value, duration) {
    this.cache.set(key, value)
    this.timestamps.set(key, Date.now() + duration)
  }

  get(key) {
    if (this.isExpired(key)) {
      this.delete(key)
      return null
    }
    return this.cache.get(key)
  }

  isExpired(key) {
    const expiry = this.timestamps.get(key)
    return !expiry || Date.now() > expiry
  }
}
```

## Rate Limiting Compliance

### TMDB Rate Limiting
- Maximum 40 requests per 10 seconds
- Automatic retry with exponential backoff
- Request queuing for burst protection
- Usage monitoring and alerting

### OMDB Rate Limiting
- Maximum 1000 requests per day (free tier)
- Graceful degradation when quota exceeded
- Optional premium tier integration
- Fallback to TMDB-only functionality

## Security Considerations

### API Key Protection
- Environment variable storage only
- No client-side key exposure
- Server-side proxy for sensitive operations
- Key rotation and monitoring capabilities

### Request Validation
- Input sanitization for all parameters
- Request size limitations
- Timeout configuration
- HTTPS enforcement for all requests
