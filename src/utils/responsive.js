/**
 * Responsive utility functions and breakpoint helpers
 */

// Tailwind CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

/**
 * Check if current screen size matches a breakpoint
 * @param {string} breakpoint - The breakpoint to check ('sm', 'md', 'lg', 'xl', '2xl')
 * @returns {boolean} - Whether the screen matches the breakpoint
 */
export const useBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS[breakpoint]
}

/**
 * Get the current breakpoint
 * @returns {string} - The current breakpoint ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'xs'
  
  const width = window.innerWidth
  
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * Check if the device is mobile (below md breakpoint)
 * @returns {boolean} - Whether the device is mobile
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < BREAKPOINTS.md
}

/**
 * Check if the device is tablet (between md and lg breakpoints)
 * @returns {boolean} - Whether the device is tablet
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

/**
 * Check if the device is desktop (lg breakpoint and above)
 * @returns {boolean} - Whether the device is desktop
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.lg
}

/**
 * Get responsive grid columns based on screen size
 * @param {Object} config - Configuration object with breakpoint keys
 * @returns {string} - Tailwind CSS grid classes
 */
export const getResponsiveGrid = (config = {}) => {
  const defaults = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  }
  
  const merged = { ...defaults, ...config }
  
  return [
    `grid-cols-${merged.xs}`,
    `sm:grid-cols-${merged.sm}`,
    `md:grid-cols-${merged.md}`,
    `lg:grid-cols-${merged.lg}`,
    `xl:grid-cols-${merged.xl}`
  ].join(' ')
}

/**
 * Get responsive spacing classes
 * @param {Object} config - Configuration object with breakpoint keys
 * @returns {string} - Tailwind CSS spacing classes
 */
export const getResponsiveSpacing = (config = {}) => {
  const defaults = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16
  }
  
  const merged = { ...defaults, ...config }
  
  return [
    `space-y-${merged.xs}`,
    `sm:space-y-${merged.sm}`,
    `md:space-y-${merged.md}`,
    `lg:space-y-${merged.lg}`,
    `xl:space-y-${merged.xl}`
  ].join(' ')
}

/**
 * Get responsive padding classes
 * @param {Object} config - Configuration object with breakpoint keys
 * @returns {string} - Tailwind CSS padding classes
 */
export const getResponsivePadding = (config = {}) => {
  const defaults = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16
  }
  
  const merged = { ...defaults, ...config }
  
  return [
    `px-${merged.xs}`,
    `sm:px-${merged.sm}`,
    `md:px-${merged.md}`,
    `lg:px-${merged.lg}`,
    `xl:px-${merged.xl}`
  ].join(' ')
}
