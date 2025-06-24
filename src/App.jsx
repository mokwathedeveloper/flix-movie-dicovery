import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { WatchlistProvider } from './context/WatchlistContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import MovieDetailPage from './pages/MovieDetailPage'
import PersonDetailPage from './pages/PersonDetailPage'
import WatchlistPage from './pages/WatchlistPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PreferencesPage from './pages/PreferencesPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ErrorBoundary from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WatchlistProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-300 transition-colors duration-300 flex flex-col">
              <Header />
              <main className="container mx-auto px-4 py-8 flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/movie/:id" element={<MovieDetailPage />} />
                  <Route path="/tv/:id" element={<MovieDetailPage />} />
                  <Route path="/person/:id" element={<PersonDetailPage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/preferences" element={<PreferencesPage />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WatchlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
