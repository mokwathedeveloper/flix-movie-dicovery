import React, { useState } from 'react'
import { Share2, Twitter, Facebook, Link, Copy, Check } from 'lucide-react'

const SocialShare = ({ 
  movie, 
  className = '',
  showLabel = true,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const title = movie?.title || movie?.name || 'Check out this movie'
  const movieUrl = `${window.location.origin}/movie/${movie?.id}`
  const description = movie?.overview ? movie.overview.substring(0, 100) + '...' : ''

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const shareData = {
    title: `${title} - Flix Movie Discovery`,
    text: `Check out "${title}" on Flix! ${description}`,
    url: movieUrl
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(movieUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(movieUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(movieUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(movieUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(movieUrl)}&title=${encodeURIComponent(title)}`
  }

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: shareUrls.twitter,
      color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: shareUrls.facebook,
      color: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: copied 
        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
        : 'hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300'
    }
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
        title="Share this movie"
      >
        <Share2 className={sizeClasses[size]} />
        {showLabel && <span className="text-sm font-medium">Share</span>}
      </button>

      {/* Share Options Dropdown */}
      {isOpen && (
        <>
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-48">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                Share "{title}"
              </div>
              
              <div className="py-2">
                {shareOptions.map((option) => {
                  const Icon = option.icon
                  
                  if (option.action) {
                    return (
                      <button
                        key={option.name}
                        onClick={option.action}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${option.color}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.name}</span>
                        {copied && option.name === 'Copy Link' && (
                          <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                            Copied!
                          </span>
                        )}
                      </button>
                    )
                  }

                  return (
                    <a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${option.color}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.name}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}

// Compact version for movie cards
export const SocialShareCompact = ({ movie }) => (
  <SocialShare 
    movie={movie} 
    showLabel={false} 
    size="sm"
    className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity"
  />
)

// Share button for detail pages
export const SocialShareButton = ({ movie, className = '' }) => (
  <SocialShare 
    movie={movie} 
    showLabel={true} 
    size="md"
    className={className}
  />
)

export default SocialShare
