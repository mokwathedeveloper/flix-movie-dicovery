import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
import UserPreferences from '../components/ui/UserPreferences'
import ErrorBoundary, { SectionErrorFallback } from '../components/ui/ErrorBoundary'

const PreferencesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your FLIX experience
              </p>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <ErrorBoundary fallback={SectionErrorFallback}>
          <UserPreferences />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default PreferencesPage
