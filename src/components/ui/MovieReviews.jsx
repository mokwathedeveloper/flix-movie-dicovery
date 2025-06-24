import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, Edit, Trash2, Plus } from 'lucide-react'
import reviewService from '../../services/reviewService'

const MovieReviews = ({ movieId, mediaType = 'movie', movieTitle }) => {
  const [reviews, setReviews] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0, distribution: {} })
  const [currentUser] = useState('current_user') // In real app, get from auth context

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    author: currentUser
  })

  useEffect(() => {
    loadReviews()
    loadRatingStats()
    loadUserRating()
  }, [movieId, mediaType])

  const loadReviews = () => {
    const movieReviews = reviewService.getMovieReviews(movieId, mediaType)
    setReviews(movieReviews)
  }

  const loadRatingStats = () => {
    const stats = reviewService.getMovieRatingStats(movieId, mediaType)
    setRatingStats(stats)
  }

  const loadUserRating = () => {
    const rating = reviewService.getUserRating(movieId, mediaType, currentUser)
    setUserRating(rating || 0)
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    
    if (editingReview) {
      reviewService.updateReview(editingReview.id, reviewForm)
      setEditingReview(null)
    } else {
      reviewService.addReview(movieId, mediaType, reviewForm)
    }
    
    setReviewForm({ rating: 5, title: '', content: '', author: currentUser })
    setShowReviewForm(false)
    loadReviews()
    loadRatingStats()
    loadUserRating()
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewForm({
      rating: review.rating,
      title: review.title,
      content: review.content,
      author: review.author
    })
    setShowReviewForm(true)
  }

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      reviewService.deleteReview(reviewId)
      loadReviews()
      loadRatingStats()
    }
  }

  const handleMarkHelpful = (reviewId) => {
    reviewService.markHelpful(reviewId)
    loadReviews()
  }

  const handleQuickRating = (rating) => {
    reviewService.addRating(movieId, mediaType, rating, currentUser)
    setUserRating(rating)
    loadRatingStats()
  }

  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 dark:text-gray-600'
                }
              `}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ratings & Reviews
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {ratingStats.average.toFixed(1)}
            </div>
            <StarRating rating={Math.round(ratingStats.average)} readonly size="lg" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Based on {ratingStats.count} {ratingStats.count === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Your Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Rating
            </p>
            <StarRating 
              rating={userRating} 
              onRatingChange={handleQuickRating}
              size="lg"
            />
            {userRating > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You rated this {userRating}/5 stars
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reviews ({reviews.length})
        </h4>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Write Review</span>
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h5>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <StarRating 
                rating={reviewForm.rating}
                onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Sum up your review in a few words"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review
              </label>
              <textarea
                value={reviewForm.content}
                onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts about this movie..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                  setReviewForm({ rating: 5, title: '', content: '', author: currentUser })
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review this {mediaType}!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-dark-100 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.title && (
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                      {review.title}
                    </h6>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {review.author} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {review.author === currentUser && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {review.content}
              </p>

              {/* Review Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MovieReviews
