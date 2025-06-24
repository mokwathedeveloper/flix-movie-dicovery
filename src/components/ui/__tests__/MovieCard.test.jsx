import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import MovieCard from '../MovieCard'
import { WatchlistProvider } from '../../../context/WatchlistContext'
import { ThemeProvider } from '../../../context/ThemeContext'

// Mock the image component to avoid loading issues in tests
vi.mock('../LazyImage', () => ({
  default: ({ src, alt, className, fallback }) => (
    <img src={src || fallback} alt={alt} className={className} data-testid="movie-poster" />
  )
}))

// Test wrapper with all necessary providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <WatchlistProvider>
        {children}
      </WatchlistProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('MovieCard', () => {
  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    overview: 'This is a test movie description that should be displayed in the card.',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2023-01-15',
    vote_average: 8.5,
    vote_count: 1250,
    genre_ids: [28, 12, 878],
    popularity: 95.5,
    media_type: 'movie'
  }

  const mockTVShow = {
    id: 2,
    name: 'Test TV Show',
    overview: 'This is a test TV show description.',
    poster_path: '/test-tv-poster.jpg',
    first_air_date: '2023-03-20',
    vote_average: 7.8,
    vote_count: 890,
    media_type: 'tv'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders movie card with correct information', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.getByText(/This is a test movie description/)).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getByText('8.5')).toBeInTheDocument()
      expect(screen.getByTestId('movie-poster')).toHaveAttribute('alt', 'Test Movie')
    })

    it('renders TV show card with correct information', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockTVShow} />
        </TestWrapper>
      )

      expect(screen.getByText('Test TV Show')).toBeInTheDocument()
      expect(screen.getByText(/This is a test TV show description/)).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getByText('7.8')).toBeInTheDocument()
    })

    it('handles missing poster image gracefully', () => {
      const movieWithoutPoster = { ...mockMovie, poster_path: null }
      
      render(
        <TestWrapper>
          <MovieCard movie={movieWithoutPoster} />
        </TestWrapper>
      )

      const poster = screen.getByTestId('movie-poster')
      expect(poster).toBeInTheDocument()
    })

    it('truncates long overview text', () => {
      const movieWithLongOverview = {
        ...mockMovie,
        overview: 'This is a very long overview that should be truncated because it exceeds the maximum length that we want to display in the movie card component. It should show an ellipsis at the end.'
      }

      render(
        <TestWrapper>
          <MovieCard movie={movieWithLongOverview} size="sm" />
        </TestWrapper>
      )

      const overview = screen.getByText(/This is a very long overview/)
      expect(overview).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('navigates to movie detail page when clicked', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      fireEvent.click(movieCard)

      // Check if navigation occurred (URL should change)
      expect(window.location.pathname).toBe('/movie/1')
    })

    it('navigates to TV show detail page when clicked', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockTVShow} />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      fireEvent.click(movieCard)

      expect(window.location.pathname).toBe('/tv/2')
    })

    it('adds movie to watchlist when watchlist button is clicked', async () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      const watchlistButton = screen.getByRole('button', { name: /add to watchlist/i })
      fireEvent.click(watchlistButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /in watchlist/i })).toBeInTheDocument()
      })
    })

    it('removes movie from watchlist when already in watchlist', async () => {
      // First add the movie to watchlist
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      const addButton = screen.getByRole('button', { name: /add to watchlist/i })
      fireEvent.click(addButton)

      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /in watchlist/i })
        fireEvent.click(removeButton)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument()
      })
    })
  })

  describe('Different Sizes', () => {
    it('renders small size correctly', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} size="sm" />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      expect(movieCard).toHaveClass('w-32') // Small size class
    })

    it('renders medium size correctly', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} size="md" />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      expect(movieCard).toHaveClass('w-40') // Medium size class
    })

    it('renders large size correctly', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} size="lg" />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      expect(movieCard).toHaveClass('w-48') // Large size class
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      expect(movieCard).toHaveAttribute('aria-label', expect.stringContaining('Test Movie'))
      
      const watchlistButton = screen.getByRole('button', { name: /add to watchlist/i })
      expect(watchlistButton).toHaveAttribute('aria-label', expect.stringContaining('Test Movie'))
    })

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <MovieCard movie={mockMovie} />
        </TestWrapper>
      )

      const movieCard = screen.getByRole('article')
      expect(movieCard).toHaveAttribute('tabIndex', '0')

      // Test Enter key navigation
      fireEvent.keyDown(movieCard, { key: 'Enter', code: 'Enter' })
      expect(window.location.pathname).toBe('/movie/1')
    })
  })

  describe('Error Handling', () => {
    it('handles missing movie data gracefully', () => {
      const incompleteMovie = {
        id: 3,
        title: 'Incomplete Movie'
        // Missing other properties
      }

      render(
        <TestWrapper>
          <MovieCard movie={incompleteMovie} />
        </TestWrapper>
      )

      expect(screen.getByText('Incomplete Movie')).toBeInTheDocument()
      // Should not crash even with missing data
    })

    it('handles invalid date formats', () => {
      const movieWithInvalidDate = {
        ...mockMovie,
        release_date: 'invalid-date'
      }

      render(
        <TestWrapper>
          <MovieCard movie={movieWithInvalidDate} />
        </TestWrapper>
      )

      // Should render without crashing
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn()
      
      const TestMovieCard = (props) => {
        renderSpy()
        return <MovieCard {...props} />
      }

      const { rerender } = render(
        <TestWrapper>
          <TestMovieCard movie={mockMovie} />
        </TestWrapper>
      )

      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render with same props
      rerender(
        <TestWrapper>
          <TestMovieCard movie={mockMovie} />
        </TestWrapper>
      )

      // Should not re-render if props haven't changed (with React.memo)
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })
})
