import { useEffect, useRef, useState, useMemo } from "react"

// How many pixels from the bottom of the container to enable auto-scroll
const ACTIVATION_THRESHOLD = 50
// Minimum pixels of scroll-up movement required to disable auto-scroll
const MIN_SCROLL_UP_THRESHOLD = 10

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousScrollTop = useRef<number | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Create a more comprehensive dependency tracking
  const dependencyHash = useMemo(() => {
    return dependencies.map(dep => {
      if (Array.isArray(dep)) {
        // For arrays (like messages), create a hash based on content
        return dep.map(item => {
          if (typeof item === 'object' && item !== null) {
            return `${item.id}-${item.content?.length || 0}-${item.role || ''}`
          }
          return String(item)
        }).join('|')
      } else if (dep instanceof Map) {
        // For Map objects (like toolCalls), create a hash based on size and keys
        return `map-${dep.size}-${Array.from(dep.keys()).join('|')}`
      } else if (typeof dep === 'object' && dep !== null) {
        // For other objects, create a hash based on keys and values
        return Object.entries(dep).map(([key, value]) => `${key}-${String(value)}`).join('|')
      }
      return String(dep)
    }).join('||')
  }, dependencies)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current

      const distanceFromBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      )

      const isScrollingUp = previousScrollTop.current
        ? scrollTop < previousScrollTop.current
        : false

      const scrollUpDistance = previousScrollTop.current
        ? previousScrollTop.current - scrollTop
        : 0

      const isDeliberateScrollUp =
        isScrollingUp && scrollUpDistance > MIN_SCROLL_UP_THRESHOLD

      if (isDeliberateScrollUp) {
        setShouldAutoScroll(false)
      } else {
        const isScrolledToBottom = distanceFromBottom < ACTIVATION_THRESHOLD
        setShouldAutoScroll(isScrolledToBottom)
      }

      previousScrollTop.current = scrollTop
    }
  }

  const handleTouchStart = () => {
    setShouldAutoScroll(false)
  }

  useEffect(() => {
    if (containerRef.current) {
      previousScrollTop.current = containerRef.current.scrollTop
    }
  }, [])

  useEffect(() => {
    if (shouldAutoScroll) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    }
  }, [dependencyHash, shouldAutoScroll])

  return {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  }
}
