import React, { useState } from 'react'
import { useInView } from 'react-intersection-observer'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder-movie.jpg',
  fallback = '/no-image.jpg',
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const getImageSrc = () => {
    if (imageError) return fallback
    if (!src || src === 'null') return fallback
    return src
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Placeholder/Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {inView && (
        <img
          src={getImageSrc()}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default LazyImage
