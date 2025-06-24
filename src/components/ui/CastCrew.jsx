import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, User, Star } from 'lucide-react'
import { getImageUrl } from '../../services/api'
import LazyImage from './LazyImage'

const CastCrew = ({ credits, title = "Cast & Crew" }) => {
  const [activeTab, setActiveTab] = useState('cast')
  const [showAll, setShowAll] = useState(false)

  if (!credits || (!credits.cast?.length && !credits.crew?.length)) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No cast and crew information available</p>
      </div>
    )
  }

  const cast = credits.cast || []
  const crew = credits.crew || []

  // Group crew by department
  const crewByDepartment = crew.reduce((acc, person) => {
    const dept = person.department || 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(person)
    return acc
  }, {})

  const displayedCast = showAll ? cast : cast.slice(0, 12)
  const hasMoreCast = cast.length > 12

  const PersonCard = ({ person, role, isCrewMember = false }) => (
    <div className="flex-shrink-0 w-32 group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
        <LazyImage
          src={getImageUrl(person.profile_path, 'w185')}
          alt={person.name}
          className="w-full h-full"
          fallback="/placeholder-person.jpg"
        />
        
        {/* Popularity indicator for main cast */}
        {!isCrewMember && person.popularity > 10 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {person.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {role}
        </p>
        {person.known_for_department && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {person.known_for_department}
          </p>
        )}
      </div>
    </div>
  )

  const ScrollableRow = ({ children, title, count }) => {
    const [scrollPosition, setScrollPosition] = useState(0)
    const containerRef = React.useRef(null)

    const scroll = (direction) => {
      const container = containerRef.current
      if (!container) return

      const scrollAmount = 264 // Width of 2 cards + gap
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }

    const canScrollLeft = scrollPosition > 0
    const canScrollRight = containerRef.current 
      ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth
      : false

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title} {count && <span className="text-gray-500">({count})</span>}
          </h4>
          
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-lg transition-colors ${
                canScrollLeft
                  ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-lg transition-colors ${
                canScrollRight
                  ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('cast')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cast'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Cast ({cast.length})
        </button>
        <button
          onClick={() => setActiveTab('crew')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'crew'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Crew ({crew.length})
        </button>
      </div>

      {/* Cast Tab */}
      {activeTab === 'cast' && (
        <div className="space-y-6">
          {cast.length > 0 ? (
            <>
              <ScrollableRow title="Main Cast" count={cast.length}>
                {displayedCast.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    role={person.character}
                  />
                ))}
              </ScrollableRow>

              {hasMoreCast && !showAll && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Show All Cast ({cast.length})
                  </button>
                </div>
              )}

              {showAll && hasMoreCast && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {cast.slice(12).map((person) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      role={person.character}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No cast information available</p>
            </div>
          )}
        </div>
      )}

      {/* Crew Tab */}
      {activeTab === 'crew' && (
        <div className="space-y-8">
          {Object.keys(crewByDepartment).length > 0 ? (
            Object.entries(crewByDepartment)
              .sort(([a], [b]) => {
                // Prioritize important departments
                const priority = ['Directing', 'Writing', 'Production', 'Camera', 'Editing', 'Sound']
                const aIndex = priority.indexOf(a)
                const bIndex = priority.indexOf(b)
                
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                if (aIndex !== -1) return -1
                if (bIndex !== -1) return 1
                return a.localeCompare(b)
              })
              .map(([department, people]) => (
                <ScrollableRow 
                  key={department} 
                  title={department} 
                  count={people.length}
                >
                  {people.map((person, index) => (
                    <PersonCard
                      key={`${person.id}-${index}`}
                      person={person}
                      role={person.job}
                      isCrewMember={true}
                    />
                  ))}
                </ScrollableRow>
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No crew information available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CastCrew
