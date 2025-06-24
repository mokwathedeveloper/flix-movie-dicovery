import { useEffect, useCallback, useState } from 'react'

const useKeyboardNavigation = (items = [], onSelect, gridColumns = 4) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isActive, setIsActive] = useState(false)

  const handleKeyDown = useCallback((event) => {
    if (!isActive || items.length === 0) return

    const { key } = event
    let newIndex = selectedIndex

    switch (key) {
      case 'ArrowRight':
        event.preventDefault()
        newIndex = Math.min(selectedIndex + 1, items.length - 1)
        break
      
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = Math.max(selectedIndex - 1, 0)
        break
      
      case 'ArrowDown':
        event.preventDefault()
        newIndex = Math.min(selectedIndex + gridColumns, items.length - 1)
        break
      
      case 'ArrowUp':
        event.preventDefault()
        newIndex = Math.max(selectedIndex - gridColumns, 0)
        break
      
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect?.(items[selectedIndex], selectedIndex)
        }
        break
      
      case 'Escape':
        event.preventDefault()
        setSelectedIndex(-1)
        setIsActive(false)
        break
      
      default:
        return
    }

    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex)
      
      // Scroll selected item into view
      const selectedElement = document.querySelector(`[data-keyboard-nav-index="${newIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      }
    }
  }, [selectedIndex, items, onSelect, gridColumns, isActive])

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isActive])

  const activate = useCallback(() => {
    setIsActive(true)
    if (selectedIndex === -1 && items.length > 0) {
      setSelectedIndex(0)
    }
  }, [selectedIndex, items.length])

  const deactivate = useCallback(() => {
    setIsActive(false)
    setSelectedIndex(-1)
  }, [])

  const selectItem = useCallback((index) => {
    setSelectedIndex(index)
    setIsActive(true)
  }, [])

  return {
    selectedIndex,
    isActive,
    activate,
    deactivate,
    selectItem,
    isSelected: (index) => isActive && selectedIndex === index
  }
}

export default useKeyboardNavigation
