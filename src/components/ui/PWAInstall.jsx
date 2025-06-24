import React, { useState } from 'react'
import { Download, X, Smartphone, Monitor, Wifi, WifiOff, Bell, BellOff } from 'lucide-react'
import usePWA from '../../hooks/usePWA'

const PWAInstall = () => {
  const {
    isInstallable,
    isInstalled,
    installPWA,
    isOnline,
    updateAvailable,
    updateServiceWorker,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    getPushSubscription
  } = usePWA()

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission)
  const [pushSubscribed, setPushSubscribed] = useState(false)

  React.useEffect(() => {
    // Check push subscription status
    const checkPushSubscription = async () => {
      const subscription = await getPushSubscription()
      setPushSubscribed(!!subscription)
    }
    
    checkPushSubscription()
  }, [getPushSubscription])

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setShowInstallPrompt(false)
    }
  }

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'granted') {
      if (pushSubscribed) {
        await unsubscribeFromPush()
        setPushSubscribed(false)
      } else {
        const subscription = await subscribeToPush()
        setPushSubscribed(!!subscription)
      }
    } else {
      const permission = await requestNotificationPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        const subscription = await subscribeToPush()
        setPushSubscribed(!!subscription)
      }
    }
  }

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className="space-y-4">
        {/* Online/Offline Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
          isOnline 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Update Available */}
        {updateAvailable && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Update Available
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  A new version of FLIX is ready to install.
                </p>
              </div>
              <button
                onClick={updateServiceWorker}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {pushSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Push Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about new trending movies
                </p>
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pushSubscribed
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {pushSubscribed ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show install prompt
  if (isInstallable && !showInstallPrompt) {
    return (
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6" />
            <div>
              <h4 className="font-semibold">Install FLIX App</h4>
              <p className="text-sm opacity-90">
                Get the full experience with offline access
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstallPrompt(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Learn More
            </button>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Detailed install prompt
  if (showInstallPrompt) {
    return (
      <div className="bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Install FLIX App</h3>
                <p className="opacity-90">Get the best movie discovery experience</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <WifiOff className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Offline Access
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse your watchlist and cached content without internet
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Bell className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Push Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about new trending movies and releases
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Smartphone className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Native Experience
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  App-like experience on your phone and desktop
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Monitor className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Quick Access
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Launch directly from your home screen or desktop
                </p>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              How to Install:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Click the "Install Now" button below</li>
              <li>Confirm the installation in your browser</li>
              <li>Find FLIX on your home screen or app drawer</li>
              <li>Enjoy the full app experience!</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Install Now
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default PWAInstall
