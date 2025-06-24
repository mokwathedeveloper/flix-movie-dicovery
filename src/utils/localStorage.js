/**
 * Utility functions for localStorage operations with error handling
 */

const STORAGE_KEYS = {
  WATCHLIST: 'flix_watchlist',
  THEME: 'flix_theme',
  USER_PREFERENCES: 'flix_user_preferences'
}

/**
 * Safely get data from localStorage
 * @param {string} key - The storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - The stored value or default value
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Safely set data to localStorage
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 * @returns {boolean} - Success status
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} - Success status
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

/**
 * Clear all app-related data from localStorage
 */
export const clearAppStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key)
  })
}

/**
 * Check if localStorage is available
 * @returns {boolean} - Availability status
 */
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (error) {
    return false
  }
}

export { STORAGE_KEYS }
