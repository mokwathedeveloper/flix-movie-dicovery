import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star, Calendar, Clock, Play, Plus, Check,
  ArrowLeft, ExternalLink, Building2
} from 'lucide-react'
import { useWatchlist } from '../context/WatchlistContext'
import { getImageUrl } from '../services/api'
import useMovieDetails from '../hooks/useMovieDetails'
import { SkeletonMovieDetail } from '../components/common/LoadingSpinner'
import SocialShare from '../components/ui/SocialShare'
import ErrorBoundary, { SectionErrorFallback } from '../components/ui/ErrorBoundary'
import CastCrew from '../components/ui/CastCrew'
import StreamingProviders from '../components/ui/StreamingProviders'
import SimilarContent from '../components/ui/SimilarContent'
import MovieReviews from '../components/ui/MovieReviews'
import TrailerModal from '../components/ui/TrailerModal'
import analyticsService from '../services/analyticsService'

const MovieDetailPage = () => {
  const { id, type } = useParams()
  const mediaType = type || 'movie'
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [trailerModal, setTrailerModal] = React.useState({ isOpen: false, videoKey: null, title: '' })

  const {
    details,
    isLoading,
    error,
    cast,
    directors,
    videos,
    genres,
    productionCompanies,
    formattedRuntime,
    releaseInfo,
    additionalRatings
  } = useMovieDetails(id, mediaType)

  const isInList = details ? isInWatchlist(details.id, mediaType) : false
  const title = details?.title || details?.name
  const overview = details?.overview
  const posterPath = details?.poster_path
  const backdropPath = details?.backdrop_path
  const voteAverage = details?.vote_average
  const voteCount = details?.vote_count

  const handleWatchlistToggle = () => {
    if (!details) return

    if (isInList) {
      removeFromWatchlist(details.id, mediaType)
    } else {
      addToWatchlist({ ...details, media_type: mediaType })
    }
  }

  const mainTrailer = videos.find(video => video.type === 'Trailer') || videos[0]

  // Track movie view for analytics
  useEffect(() => {
    if (details) {
      analyticsService.trackMovieView(details)
    }
  }, [details])

  const handleTrailerPlay = () => {
    if (mainTrailer) {
      setTrailerModal({
        isOpen: true,
        videoKey: mainTrailer.key,
        title: title
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
        <SkeletonMovieDetail />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Content Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested {mediaType} could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div>

      {/* Hero Section with Backdrop */}
      {backdropPath && (
        <div className="relative -mx-4 h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl">
          <img
            src={getImageUrl(backdropPath, 'w1280')}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Play Trailer Button */}
          {mainTrailer && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handleTrailerPlay}
                className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105"
              >
                <Play className="w-6 h-6 fill-current" />
                <span className="font-medium">Watch Trailer</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <img
              src={getImageUrl(posterPath, 'w500')}
              alt={title}
              className="w-full max-w-sm mx-auto lg:max-w-none rounded-2xl shadow-2xl"
            />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleWatchlistToggle}
                className={`
                  w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${isInList
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                  }
                `}
              >
                {isInList ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              <SocialShare
                movie={details}
                className="w-full"
              />

              {details.homepage && (
                <a
                  href={details.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Official Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title and Basic Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h1>
              {details.tagline && (
                <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                  "{details.tagline}"
                </p>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {releaseInfo && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{releaseInfo}</span>
                </div>
              )}

              {formattedRuntime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formattedRuntime}</span>
                </div>
              )}

              {mediaType === 'tv' && details.number_of_seasons && (
                <div className="flex items-center space-x-1">
                  <span>{details.number_of_seasons} Season{details.number_of_seasons !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Ratings */}
            <div className="flex flex-wrap items-center gap-6">
              {voteAverage > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">
                      {voteAverage.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({voteCount?.toLocaleString()} votes)
                  </span>
                </div>
              )}

              {/* Additional Ratings from OMDB */}
              {additionalRatings && (
                <div className="flex flex-wrap gap-3">
                  {additionalRatings.imdb && (
                    <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                        IMDb {additionalRatings.imdb.score}
                      </span>
                    </div>
                  )}
                  {additionalRatings.rottenTomatoes && (
                    <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        RT {additionalRatings.rottenTomatoes}
                      </span>
                    </div>
                  )}
                  {additionalRatings.metacritic && (
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        MC {additionalRatings.metacritic}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          {overview && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {overview}
              </p>
            </div>
          )}

          {/* Cast & Crew */}
          <ErrorBoundary fallback={SectionErrorFallback}>
            <CastCrew credits={{ cast, crew: [] }} />
          </ErrorBoundary>

          {/* Directors */}
          {directors.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Director{directors.length > 1 ? 's' : ''}
              </h2>
              <div className="flex flex-wrap gap-2">
                {directors.map((director) => (
                  <span
                    key={director.id}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                  >
                    {director.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Streaming Providers */}
          <ErrorBoundary fallback={SectionErrorFallback}>
            <StreamingProviders
              movieId={mediaType === 'movie' ? id : null}
              tvId={mediaType === 'tv' ? id : null}
              mediaType={mediaType}
            />
          </ErrorBoundary>

          {/* Production Companies */}
          {productionCompanies.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Production</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {productionCompanies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-2">
                    {company.logo_path && (
                      <img
                        src={getImageUrl(company.logo_path, 'w200')}
                        alt={company.name}
                        className="h-8 object-contain"
                      />
                    )}
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {company.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Ratings */}
          <ErrorBoundary fallback={SectionErrorFallback}>
            <MovieReviews
              movieId={id}
              mediaType={mediaType}
              movieTitle={title}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Similar Content */}
      <ErrorBoundary fallback={SectionErrorFallback}>
        <SimilarContent
          movieId={mediaType === 'movie' ? id : null}
          tvId={mediaType === 'tv' ? id : null}
          mediaType={mediaType}
          title={`More Like ${title}`}
        />
      </ErrorBoundary>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, videoKey: null, title: '' })}
        videoKey={trailerModal.videoKey}
        title={trailerModal.title}
      />
    </div>
  )
}

export default MovieDetailPage
