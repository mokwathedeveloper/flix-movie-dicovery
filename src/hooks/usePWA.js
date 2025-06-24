import { useState, useEffect } from 'react'

const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = window.navigator.standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Service worker update detection
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleServiceWorkerUpdate()
              }
            })
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install the PWA
  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }

  // Update the service worker
  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
          }
        })
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return 'not-supported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Show local notification
  const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
    
    return null
  }

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        throw new Error('Service worker not registered')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      })

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Get current push subscription
  const getPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        return null
      }

      return await registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    try {
      const subscription = await getPushSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  return {
    // Installation
    isInstallable,
    isInstalled,
    installPWA,
    
    // Network status
    isOnline,
    
    // Updates
    updateAvailable,
    updateServiceWorker,
    
    // Notifications
    requestNotificationPermission,
    showNotification,
    subscribeToPush,
    getPushSubscription,
    unsubscribeFromPush
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

export default usePWA
