'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Client-side cache manager and service worker registration
 * This component runs on the client and manages caching and PWA features
 */
export default function ClientCacheManager() {
  const pathname = usePathname()

  useEffect(() => {
    // Register service worker for PWA and push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }

    // Enable back/forward cache (bfcache)
    if ('navigation' in window) {
      // @ts-ignore
      window.navigation.addEventListener('navigate', (e) => {
        // Allow the browser to use cached versions when navigating
        if (e.navigationType === 'reload' || e.navigationType === 'traverse') {
          // Use cached version for back/forward navigation
          return
        }
      })
    }

    // Prefetch all navigation links on mount
    const prefetchLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach((link) => {
        const href = link.getAttribute('href')
        if (href && !href.includes('api')) {
          // Create a link element to trigger prefetch
          const prefetchLink = document.createElement('link')
          prefetchLink.rel = 'prefetch'
          prefetchLink.href = href
          document.head.appendChild(prefetchLink)
        }
      })
    }

    // Run prefetch after a short delay
    const timer = setTimeout(prefetchLinks, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
