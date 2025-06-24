import React, { useMemo } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import MovieCard from '../MovieCard'

const VirtualMovieGrid = ({ 
  movies = [], 
  height = 600, 
  itemWidth = 200, 
  itemHeight = 300,
  gap = 16,
  onMovieClick,
  onWatchlistToggle 
}) => {
  // Calculate grid dimensions
  const containerWidth = window.innerWidth - 64 // Account for padding
  const columnsCount = Math.floor(containerWidth / (itemWidth + gap))
  const rowsCount = Math.ceil(movies.length / columnsCount)

  // Memoized cell renderer
  const Cell = useMemo(() => {
    return ({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * columnsCount + columnIndex
      const movie = movies[index]

      if (!movie) return null

      return (
        <div
          style={{
            ...style,
            left: style.left + gap / 2,
            top: style.top + gap / 2,
            width: style.width - gap,
            height: style.height - gap,
          }}
        >
          <MovieCard
            movie={movie}
            onClick={() => onMovieClick?.(movie)}
            onWatchlistToggle={() => onWatchlistToggle?.(movie)}
          />
        </div>
      )
    }
  }, [movies, columnsCount, gap, onMovieClick, onWatchlistToggle])

  if (!movies.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No movies to display</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={columnsCount}
        columnWidth={itemWidth + gap}
        height={height}
        rowCount={rowsCount}
        rowHeight={itemHeight + gap}
        width={containerWidth}
        className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
      >
        {Cell}
      </Grid>
    </div>
  )
}

export default VirtualMovieGrid
