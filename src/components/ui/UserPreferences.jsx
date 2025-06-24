import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Settings, Save, RotateCcw, Bell, Download, Palette, Globe, Shield } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import usePWA from '../../hooks/usePWA'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../../utils/localStorage'

// Move components outside to prevent re-creation on every render
const PreferenceSection = React.memo(({ title, icon: Icon, children }) => (
  <section
    className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
      <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
      <h3
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        {title}
      </h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </section>
))

const PreferenceItem = React.memo(({ label, description, children, id }) => (
  <div className="flex flex-col space-y-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
    <div className="flex-1 min-w-0">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-900 dark:text-gray-100 block"
      >
        {label}
      </label>
      {description && (
        <p
          id={`${id}-description`}
          className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words"
        >
          {description}
        </p>
      )}
    </div>
    <div className="flex-shrink-0 sm:ml-4">
      {children}
    </div>
  </div>
))

const Toggle = React.memo(({ checked, onChange, disabled = false, id, ariaDescribedBy }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-describedby={ariaDescribedBy}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`
      relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
      ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-primary-700'}
    `}
  >
    <span
      className={`
        inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
      aria-hidden="true"
    />
  </button>
))

const UserPreferences = ({ onClose }) => {
  // Safely get theme context with fallback
  let themeContext
  try {
    themeContext = useTheme()
  } catch (error) {
    console.error('Theme context error:', error)
    themeContext = {
      theme: 'light',
      setTheme: () => {},
      availableThemes: ['light', 'dark'],
      autoTheme: false,
      toggleAutoTheme: () => {}
    }
  }

  const { theme, setTheme, availableThemes, autoTheme, toggleAutoTheme } = themeContext

  // Safely get PWA context with fallback
  let pwaContext
  try {
    pwaContext = usePWA()
  } catch (error) {
    console.error('PWA context error:', error)
    pwaContext = {
      requestNotificationPermission: async () => 'not-supported',
      subscribeToPush: async () => null,
      unsubscribeFromPush: async () => false,
      getPushSubscription: async () => null
    }
  }

  const {
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    getPushSubscription
  } = pwaContext

  const [preferences, setPreferences] = useState({
    // Display preferences
    defaultView: 'grid',
    itemsPerPage: 20,
    showAdultContent: false,
    
    // Content preferences
    preferredLanguage: 'en',
    preferredRegion: 'US',
    favoriteGenres: [],
    
    // Notification preferences
    enableNotifications: false,
    notifyNewReleases: true,
    notifyTrending: false,
    notifyRecommendations: true,
    
    // Privacy preferences
    trackAnalytics: true,
    shareWatchlist: false,
    
    // Export preferences
    exportFormat: 'json',
    includePosters: true
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    try {
      const savedPreferences = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {})
      setPreferences(prev => ({ ...prev, ...savedPreferences }))
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }, [])

  // Check notification status - memoize the function to prevent re-renders
  const checkNotificationStatus = useCallback(async () => {
    try {
      const subscription = await getPushSubscription()
      setPreferences(prev => ({
        ...prev,
        enableNotifications: !!subscription
      }))
    } catch (error) {
      console.error('Failed to check notification status:', error)
    }
  }, [getPushSubscription])

  useEffect(() => {
    checkNotificationStatus()
  }, [checkNotificationStatus])

  // Memoize handlers to prevent unnecessary re-renders
  const handlePreferenceChange = useCallback((key, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value }
      return newPrefs
    })
    setHasChanges(true)
  }, [])

  const handleNestedPreferenceChange = useCallback((category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }))
    setHasChanges(true)
  }, [])

  const handleNotificationToggle = useCallback(async () => {
    try {
      if (preferences.enableNotifications) {
        await unsubscribeFromPush()
        handlePreferenceChange('enableNotifications', false)
      } else {
        const permission = await requestNotificationPermission()
        if (permission === 'granted') {
          await subscribeToPush()
          handlePreferenceChange('enableNotifications', true)
        }
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    }
  }, [preferences.enableNotifications, unsubscribeFromPush, requestNotificationPermission, subscribeToPush, handlePreferenceChange])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      setToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences)
      setHasChanges(false)

      // Show success message
      setTimeout(() => {
        setSaving(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setSaving(false)
    }
  }, [preferences])

  // Memoize default preferences to prevent recreation on every render
  const defaultPreferences = useMemo(() => ({
    defaultView: 'grid',
    itemsPerPage: 20,
    showAdultContent: false,
    preferredLanguage: 'en',
    preferredRegion: 'US',
    favoriteGenres: [],
    enableNotifications: false,
    notifyNewReleases: true,
    notifyTrending: false,
    notifyRecommendations: true,
    trackAnalytics: true,
    shareWatchlist: false,
    exportFormat: 'json',
    includePosters: true
  }), [])

  const handleReset = useCallback(() => {
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }, [defaultPreferences])



  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-primary-600" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              User Preferences
            </h2>
            {hasChanges && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                You have unsaved changes
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`
              flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-w-[120px]
              ${hasChanges && !saving
                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:scale-105 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
              }
            `}
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Appearance */}
      <PreferenceSection title="Appearance" icon={Palette}>
        <PreferenceItem
          id="theme-select"
          label="Theme"
          description="Choose your preferred color theme"
        >
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value)
              setHasChanges(true)
            }}
            aria-describedby="theme-select-description"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            {availableThemes.map((themeName) => (
              <option key={themeName} value={themeName}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </option>
            ))}
          </select>
        </PreferenceItem>

        <PreferenceItem
          id="auto-theme-toggle"
          label="Auto Theme"
          description="Automatically switch theme based on system preference"
        >
          <Toggle
            id="auto-theme-toggle"
            checked={autoTheme}
            ariaDescribedBy="auto-theme-toggle-description"
            onChange={() => {
              toggleAutoTheme()
              setHasChanges(true)
            }}
          />
        </PreferenceItem>

        <PreferenceItem
          id="default-view-select"
          label="Default View"
          description="Choose how content is displayed by default"
        >
          <select
            id="default-view-select"
            value={preferences.defaultView}
            onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
            aria-describedby="default-view-select-description"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </PreferenceItem>
      </PreferenceSection>

      {/* Content */}
      <PreferenceSection title="Content" icon={Globe}>
        <PreferenceItem
          id="preferred-language-select"
          label="Preferred Language"
          description="Language for movie and TV show information"
        >
          <select
            id="preferred-language-select"
            value={preferences.preferredLanguage}
            onChange={(e) => handlePreferenceChange('preferredLanguage', e.target.value)}
            aria-describedby="preferred-language-select-description"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
          </select>
        </PreferenceItem>

        <PreferenceItem
          id="preferred-region-select"
          label="Preferred Region"
          description="Region for streaming availability and release dates"
        >
          <select
            id="preferred-region-select"
            value={preferences.preferredRegion}
            onChange={(e) => handlePreferenceChange('preferredRegion', e.target.value)}
            aria-describedby="preferred-region-select-description"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="JP">Japan</option>
            <option value="KR">South Korea</option>
          </select>
        </PreferenceItem>

        <PreferenceItem
          id="show-adult-content-toggle"
          label="Show Adult Content"
          description="Include adult content in search results and recommendations"
        >
          <Toggle
            id="show-adult-content-toggle"
            checked={preferences.showAdultContent}
            ariaDescribedBy="show-adult-content-toggle-description"
            onChange={(value) => handlePreferenceChange('showAdultContent', value)}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Notifications */}
      <PreferenceSection title="Notifications" icon={Bell}>
        <PreferenceItem
          id="enable-notifications-toggle"
          label="Enable Notifications"
          description="Receive push notifications about new content"
        >
          <Toggle
            id="enable-notifications-toggle"
            checked={preferences.enableNotifications}
            ariaDescribedBy="enable-notifications-toggle-description"
            onChange={handleNotificationToggle}
          />
        </PreferenceItem>

        <PreferenceItem
          id="notify-new-releases-toggle"
          label="New Releases"
          description="Notify when new movies and shows are released"
        >
          <Toggle
            id="notify-new-releases-toggle"
            checked={preferences.notifyNewReleases}
            ariaDescribedBy="notify-new-releases-toggle-description"
            onChange={(value) => handlePreferenceChange('notifyNewReleases', value)}
            disabled={!preferences.enableNotifications}
          />
        </PreferenceItem>

        <PreferenceItem
          id="notify-trending-toggle"
          label="Trending Content"
          description="Notify about trending movies and shows"
        >
          <Toggle
            id="notify-trending-toggle"
            checked={preferences.notifyTrending}
            ariaDescribedBy="notify-trending-toggle-description"
            onChange={(value) => handlePreferenceChange('notifyTrending', value)}
            disabled={!preferences.enableNotifications}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Privacy */}
      <PreferenceSection title="Privacy" icon={Shield}>
        <PreferenceItem
          id="track-analytics-toggle"
          label="Analytics Tracking"
          description="Help improve the app by sharing anonymous usage data"
        >
          <Toggle
            id="track-analytics-toggle"
            checked={preferences.trackAnalytics}
            ariaDescribedBy="track-analytics-toggle-description"
            onChange={(value) => handlePreferenceChange('trackAnalytics', value)}
          />
        </PreferenceItem>

        <PreferenceItem
          id="share-watchlist-toggle"
          label="Share Watchlist"
          description="Allow others to view your public watchlist"
        >
          <Toggle
            id="share-watchlist-toggle"
            checked={preferences.shareWatchlist}
            ariaDescribedBy="share-watchlist-toggle-description"
            onChange={(value) => handlePreferenceChange('shareWatchlist', value)}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Export */}
      <PreferenceSection title="Data Export" icon={Download}>
        <PreferenceItem
          id="export-format-select"
          label="Export Format"
          description="Default format for exporting your data"
        >
          <select
            id="export-format-select"
            value={preferences.exportFormat}
            onChange={(e) => handlePreferenceChange('exportFormat', e.target.value)}
            aria-describedby="export-format-select-description"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </PreferenceItem>

        <PreferenceItem
          id="include-posters-toggle"
          label="Include Posters"
          description="Include movie posters in exported data"
        >
          <Toggle
            id="include-posters-toggle"
            checked={preferences.includePosters}
            ariaDescribedBy="include-posters-toggle-description"
            onChange={(value) => handlePreferenceChange('includePosters', value)}
          />
        </PreferenceItem>
      </PreferenceSection>
    </div>
  )
}

export default UserPreferences
