class SocialService {
  // Generate shareable watchlist URL
  generateShareableWatchlist(watchlist, userInfo = {}) {
    const shareData = {
      id: this.generateShareId(),
      title: userInfo.name ? `${userInfo.name}'s Watchlist` : 'My Movie Watchlist',
      description: `Check out my movie watchlist with ${watchlist.length} movies!`,
      movies: watchlist.map(movie => ({
        id: movie.id,
        title: movie.title || movie.name,
        media_type: movie.media_type,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date
      })),
      createdAt: new Date().toISOString(),
      userInfo: {
        name: userInfo.name || 'Anonymous',
        avatar: userInfo.avatar || null
      }
    }

    // Store in localStorage with expiry (30 days)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    
    localStorage.setItem(`shared_watchlist_${shareData.id}`, JSON.stringify({
      ...shareData,
      expiresAt: expiryDate.toISOString()
    }))

    return `${window.location.origin}/shared/watchlist/${shareData.id}`
  }

  // Get shared watchlist by ID
  getSharedWatchlist(shareId) {
    const stored = localStorage.getItem(`shared_watchlist_${shareId}`)
    if (!stored) return null

    const data = JSON.parse(stored)
    
    // Check if expired
    if (new Date() > new Date(data.expiresAt)) {
      localStorage.removeItem(`shared_watchlist_${shareId}`)
      return null
    }

    return data
  }

  // Generate unique share ID
  generateShareId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Share on social platforms
  shareOnPlatform(platform, url, title, description) {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  }

  // Share movie recommendation
  shareMovie(movie, message = '') {
    const movieUrl = `${window.location.origin}/${movie.media_type || 'movie'}/${movie.id}`
    const title = `Check out "${movie.title || movie.name}"`
    const description = message || movie.overview || 'Great movie recommendation!'
    
    return {
      url: movieUrl,
      title,
      description,
      share: (platform) => this.shareOnPlatform(platform, movieUrl, title, description)
    }
  }

  // Generate movie collection share
  shareMovieCollection(movies, collectionName, description = '') {
    const shareData = {
      id: this.generateShareId(),
      type: 'collection',
      name: collectionName,
      description: description || `A curated collection of ${movies.length} movies`,
      movies: movies.slice(0, 20), // Limit to 20 movies for sharing
      createdAt: new Date().toISOString()
    }

    // Store collection
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    
    localStorage.setItem(`shared_collection_${shareData.id}`, JSON.stringify({
      ...shareData,
      expiresAt: expiryDate.toISOString()
    }))

    return `${window.location.origin}/shared/collection/${shareData.id}`
  }

  // Get shared collection
  getSharedCollection(shareId) {
    const stored = localStorage.getItem(`shared_collection_${shareId}`)
    if (!stored) return null

    const data = JSON.parse(stored)
    
    if (new Date() > new Date(data.expiresAt)) {
      localStorage.removeItem(`shared_collection_${shareId}`)
      return null
    }

    return data
  }

  // Get all user's shared items
  getUserSharedItems() {
    const items = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('shared_watchlist_') || key.startsWith('shared_collection_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          if (new Date() <= new Date(data.expiresAt)) {
            items.push({
              id: data.id,
              type: key.startsWith('shared_watchlist_') ? 'watchlist' : 'collection',
              title: data.title || data.name,
              description: data.description,
              itemCount: data.movies.length,
              createdAt: data.createdAt,
              url: key.startsWith('shared_watchlist_') 
                ? `/shared/watchlist/${data.id}`
                : `/shared/collection/${data.id}`
            })
          }
        } catch (e) {
          // Invalid data, skip
        }
      }
    }

    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Delete shared item
  deleteSharedItem(shareId, type) {
    const key = type === 'watchlist' ? `shared_watchlist_${shareId}` : `shared_collection_${shareId}`
    localStorage.removeItem(key)
  }
}

export default new SocialService()
