import React, { createContext, useContext, useEffect, useState } from 'react'
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/localStorage'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return getFromStorage(STORAGE_KEYS.THEME, 'light')
  })

  const [autoTheme, setAutoTheme] = useState(() => {
    // Get auto theme preference from localStorage
    return getFromStorage(STORAGE_KEYS.AUTO_THEME, false)
  })

  const availableThemes = ['light', 'dark', 'system']

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    let effectiveTheme = theme

    // If auto theme is enabled or theme is 'system', use system preference
    if (autoTheme || theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      effectiveTheme = mediaQuery.matches ? 'dark' : 'light'
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Save theme preference
    setToStorage(STORAGE_KEYS.THEME, theme)
    setToStorage(STORAGE_KEYS.AUTO_THEME, autoTheme)
  }, [theme, autoTheme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      // Only auto-switch if auto theme is enabled or theme is 'system'
      if (autoTheme || theme === 'system') {
        const root = document.documentElement
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [autoTheme, theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const toggleAutoTheme = () => {
    setAutoTheme(prev => !prev)
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')

  const value = {
    theme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    availableThemes,
    autoTheme,
    toggleAutoTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
