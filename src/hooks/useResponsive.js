import { useState, useEffect } from 'react'
import { BREAKPOINTS, getCurrentBreakpoint, isMobile, isTablet, isDesktop } from '../utils/responsive'

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    breakpoint: typeof window !== 'undefined' ? getCurrentBreakpoint() : 'xs',
    isMobile: typeof window !== 'undefined' ? isMobile() : false,
    isTablet: typeof window !== 'undefined' ? isTablet() : false,
    isDesktop: typeof window !== 'undefined' ? isDesktop() : false
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        breakpoint: getCurrentBreakpoint(),
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop()
      })
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Helper functions
  const isBreakpoint = (breakpoint) => {
    return screenSize.width >= BREAKPOINTS[breakpoint]
  }

  const isBreakpointOnly = (breakpoint) => {
    const breakpointKeys = Object.keys(BREAKPOINTS)
    const currentIndex = breakpointKeys.indexOf(breakpoint)
    
    if (currentIndex === -1) return false
    
    const minWidth = BREAKPOINTS[breakpoint]
    const maxWidth = currentIndex < breakpointKeys.length - 1 
      ? BREAKPOINTS[breakpointKeys[currentIndex + 1]] - 1 
      : Infinity
    
    return screenSize.width >= minWidth && screenSize.width <= maxWidth
  }

  const isBreakpointDown = (breakpoint) => {
    return screenSize.width < BREAKPOINTS[breakpoint]
  }

  return {
    ...screenSize,
    isBreakpoint,
    isBreakpointOnly,
    isBreakpointDown
  }
}

export default useResponsive
