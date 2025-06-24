class ReviewService {
  constructor() {
    this.storageKey = 'flix_reviews'
    this.ratingsKey = 'flix_ratings'
  }

  // Get all reviews for a movie
  getMovieReviews(movieId, mediaType = 'movie') {
    const reviews = this.getAllReviews()
    const movieKey = `${mediaType}_${movieId}`
    return reviews[movieKey] || []
  }

  // Add a review
  addReview(movieId, mediaType, review) {
    const reviews = this.getAllReviews()
    const movieKey = `${mediaType}_${movieId}`
    
    if (!reviews[movieKey]) {
      reviews[movieKey] = []
    }

    const newReview = {
      id: this.generateId(),
      movieId,
      mediaType,
      rating: review.rating,
      title: review.title || '',
      content: review.content || '',
      author: review.author || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpful: 0,
      reported: false
    }

    reviews[movieKey].push(newReview)
    this.saveReviews(reviews)

    // Also save the rating separately
    this.addRating(movieId, mediaType, review.rating, review.author)

    return newReview
  }

  // Update a review
  updateReview(reviewId, updates) {
    const reviews = this.getAllReviews()
    
    for (const movieKey in reviews) {
      const reviewIndex = reviews[movieKey].findIndex(r => r.id === reviewId)
      if (reviewIndex !== -1) {
        reviews[movieKey][reviewIndex] = {
          ...reviews[movieKey][reviewIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveReviews(reviews)
        return reviews[movieKey][reviewIndex]
      }
    }
    
    return null
  }

  // Delete a review
  deleteReview(reviewId) {
    const reviews = this.getAllReviews()
    
    for (const movieKey in reviews) {
      const reviewIndex = reviews[movieKey].findIndex(r => r.id === reviewId)
      if (reviewIndex !== -1) {
        const deletedReview = reviews[movieKey].splice(reviewIndex, 1)[0]
        this.saveReviews(reviews)
        return deletedReview
      }
    }
    
    return null
  }

  // Mark review as helpful
  markHelpful(reviewId) {
    const reviews = this.getAllReviews()
    
    for (const movieKey in reviews) {
      const review = reviews[movieKey].find(r => r.id === reviewId)
      if (review) {
        review.helpful = (review.helpful || 0) + 1
        this.saveReviews(reviews)
        return review
      }
    }
    
    return null
  }

  // Get user's reviews
  getUserReviews(author) {
    const reviews = this.getAllReviews()
    const userReviews = []
    
    for (const movieKey in reviews) {
      const movieReviews = reviews[movieKey].filter(r => r.author === author)
      userReviews.push(...movieReviews)
    }
    
    return userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Rating system
  addRating(movieId, mediaType, rating, user = 'anonymous') {
    const ratings = this.getAllRatings()
    const movieKey = `${mediaType}_${movieId}`
    
    if (!ratings[movieKey]) {
      ratings[movieKey] = []
    }

    // Remove existing rating from same user
    ratings[movieKey] = ratings[movieKey].filter(r => r.user !== user)
    
    // Add new rating
    ratings[movieKey].push({
      user,
      rating: parseFloat(rating),
      createdAt: new Date().toISOString()
    })

    this.saveRatings(ratings)
    return this.getMovieRatingStats(movieId, mediaType)
  }

  // Get movie rating statistics
  getMovieRatingStats(movieId, mediaType = 'movie') {
    const ratings = this.getAllRatings()
    const movieKey = `${mediaType}_${movieId}`
    const movieRatings = ratings[movieKey] || []
    
    if (movieRatings.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const sum = movieRatings.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / movieRatings.length
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    movieRatings.forEach(r => {
      const rounded = Math.round(r.rating)
      if (distribution[rounded] !== undefined) {
        distribution[rounded]++
      }
    })

    return {
      average: Math.round(average * 10) / 10,
      count: movieRatings.length,
      distribution
    }
  }

  // Get user's rating for a movie
  getUserRating(movieId, mediaType, user) {
    const ratings = this.getAllRatings()
    const movieKey = `${mediaType}_${movieId}`
    const movieRatings = ratings[movieKey] || []
    
    const userRating = movieRatings.find(r => r.user === user)
    return userRating ? userRating.rating : null
  }

  // Storage helpers
  getAllReviews() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
    } catch {
      return {}
    }
  }

  saveReviews(reviews) {
    localStorage.setItem(this.storageKey, JSON.stringify(reviews))
  }

  getAllRatings() {
    try {
      return JSON.parse(localStorage.getItem(this.ratingsKey) || '{}')
    } catch {
      return {}
    }
  }

  saveRatings(ratings) {
    localStorage.setItem(this.ratingsKey, JSON.stringify(ratings))
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Get review statistics
  getReviewStats() {
    const reviews = this.getAllReviews()
    let totalReviews = 0
    let totalMovies = 0
    
    for (const movieKey in reviews) {
      totalMovies++
      totalReviews += reviews[movieKey].length
    }

    return {
      totalReviews,
      totalMovies,
      averageReviewsPerMovie: totalMovies > 0 ? Math.round(totalReviews / totalMovies * 10) / 10 : 0
    }
  }

  // Export reviews
  exportReviews() {
    const reviews = this.getAllReviews()
    const ratings = this.getAllRatings()
    
    return {
      reviews,
      ratings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  // Import reviews
  importReviews(data) {
    if (data.reviews) {
      this.saveReviews(data.reviews)
    }
    if (data.ratings) {
      this.saveRatings(data.ratings)
    }
  }
}

export default new ReviewService()
