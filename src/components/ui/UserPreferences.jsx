import React, { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, Bell, Download, Palette, Globe, Shield } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import usePWA from '../../hooks/usePWA'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../../utils/localStorage'

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

  // Check notification status
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const subscription = await getPushSubscription()
        setPreferences(prev => ({
          ...prev,
          enableNotifications: !!subscription
        }))
      } catch (error) {
        console.error('Failed to check notification status:', error)
      }
    }

    checkNotificationStatus()
  }, [getPushSubscription])

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleNestedPreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }))
    setHasChanges(true)
  }

  const handleNotificationToggle = async () => {
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
  }

  const handleSave = async () => {
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
  }

  const handleReset = () => {
    const defaultPreferences = {
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
    }
    
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }

  const PreferenceSection = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <Icon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )

  const PreferenceItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  )

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Preferences
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${hasChanges && !saving
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Appearance */}
      <PreferenceSection title="Appearance" icon={Palette}>
        <PreferenceItem
          label="Theme"
          description="Choose your preferred color theme"
        >
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {availableThemes.map((themeName) => (
              <option key={themeName} value={themeName}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </option>
            ))}
          </select>
        </PreferenceItem>

        <PreferenceItem
          label="Auto Theme"
          description="Automatically switch theme based on system preference"
        >
          <Toggle
            checked={autoTheme}
            onChange={toggleAutoTheme}
          />
        </PreferenceItem>

        <PreferenceItem
          label="Default View"
          description="Choose how content is displayed by default"
        >
          <select
            value={preferences.defaultView}
            onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </PreferenceItem>
      </PreferenceSection>

      {/* Content */}
      <PreferenceSection title="Content" icon={Globe}>
        <PreferenceItem
          label="Preferred Language"
          description="Language for movie and TV show information"
        >
          <select
            value={preferences.preferredLanguage}
            onChange={(e) => handlePreferenceChange('preferredLanguage', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          label="Preferred Region"
          description="Region for streaming availability and release dates"
        >
          <select
            value={preferences.preferredRegion}
            onChange={(e) => handlePreferenceChange('preferredRegion', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          label="Show Adult Content"
          description="Include adult content in search results and recommendations"
        >
          <Toggle
            checked={preferences.showAdultContent}
            onChange={(value) => handlePreferenceChange('showAdultContent', value)}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Notifications */}
      <PreferenceSection title="Notifications" icon={Bell}>
        <PreferenceItem
          label="Enable Notifications"
          description="Receive push notifications about new content"
        >
          <Toggle
            checked={preferences.enableNotifications}
            onChange={handleNotificationToggle}
          />
        </PreferenceItem>

        <PreferenceItem
          label="New Releases"
          description="Notify when new movies and shows are released"
        >
          <Toggle
            checked={preferences.notifyNewReleases}
            onChange={(value) => handlePreferenceChange('notifyNewReleases', value)}
            disabled={!preferences.enableNotifications}
          />
        </PreferenceItem>

        <PreferenceItem
          label="Trending Content"
          description="Notify about trending movies and shows"
        >
          <Toggle
            checked={preferences.notifyTrending}
            onChange={(value) => handlePreferenceChange('notifyTrending', value)}
            disabled={!preferences.enableNotifications}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Privacy */}
      <PreferenceSection title="Privacy" icon={Shield}>
        <PreferenceItem
          label="Analytics Tracking"
          description="Help improve the app by sharing anonymous usage data"
        >
          <Toggle
            checked={preferences.trackAnalytics}
            onChange={(value) => handlePreferenceChange('trackAnalytics', value)}
          />
        </PreferenceItem>

        <PreferenceItem
          label="Share Watchlist"
          description="Allow others to view your public watchlist"
        >
          <Toggle
            checked={preferences.shareWatchlist}
            onChange={(value) => handlePreferenceChange('shareWatchlist', value)}
          />
        </PreferenceItem>
      </PreferenceSection>

      {/* Export */}
      <PreferenceSection title="Data Export" icon={Download}>
        <PreferenceItem
          label="Export Format"
          description="Default format for exporting your data"
        >
          <select
            value={preferences.exportFormat}
            onChange={(e) => handlePreferenceChange('exportFormat', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </PreferenceItem>

        <PreferenceItem
          label="Include Posters"
          description="Include movie posters in exported data"
        >
          <Toggle
            checked={preferences.includePosters}
            onChange={(value) => handlePreferenceChange('includePosters', value)}
          />
        </PreferenceItem>
      </PreferenceSection>
    </div>
  )
}

export default UserPreferences
