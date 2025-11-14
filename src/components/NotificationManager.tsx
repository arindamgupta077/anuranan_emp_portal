'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Bell, BellOff, X } from 'lucide-react'
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getCurrentSubscription,
  showLocalNotification,
} from '@/lib/utils/notification'

// VAPID public key - Generate using: npx web-push generate-vapid-keys
// Add the public key to .env.local as NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function NotificationManagerContent() {
  const [mounted, setMounted] = useState(false)
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return
    
    setMounted(true)
    console.log('[NotificationManager] Component mounted')
    console.log('[NotificationManager] VAPID Key available:', !!VAPID_PUBLIC_KEY)
    checkNotificationStatus()
  }, [])

  async function checkNotificationStatus() {
    console.log('[NotificationManager] Checking notification status...')
    const state = await getNotificationPermissionState()
    console.log('[NotificationManager] Support:', state.supported, 'Permission:', state.permission)
    setSupported(state.supported)
    setPermission(state.permission)

    if (state.permission === 'granted') {
      const subscription = await getCurrentSubscription()
      setSubscribed(!!subscription)
    }

    // Show banner if supported and not yet decided
    if (state.supported && state.permission === 'default') {
      setShowBanner(true)
    }
  }

  async function handleEnableNotifications() {
    if (!supported) {
      alert('Push notifications are not supported in your browser')
      return
    }

    setLoading(true)

    try {
      console.log('[NotificationManager] Starting notification setup...')
      console.log('[NotificationManager] VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY ? 'Set ✅' : 'Not set ❌')
      console.log('[NotificationManager] VAPID Key length:', VAPID_PUBLIC_KEY?.length || 0)
      console.log('[NotificationManager] First 20 chars:', VAPID_PUBLIC_KEY?.substring(0, 20) || 'N/A')
      
      // Check if service worker is registered with timeout
      if (!navigator.serviceWorker.controller) {
        console.log('[NotificationManager] Service worker not active, waiting for registration...')
        
        // Add timeout to prevent infinite waiting
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service worker registration timeout after 10 seconds')), 10000)
        )
        
        try {
          await Promise.race([navigator.serviceWorker.ready, timeout])
          console.log('[NotificationManager] Service worker is now ready ✅')
        } catch (error) {
          console.error('[NotificationManager] Service worker failed to become ready:', error)
          throw new Error('Service worker is not available. Please refresh the page and try again.')
        }
      } else {
        console.log('[NotificationManager] Service worker already active ✅')
      }
      
      // Request permission
      console.log('[NotificationManager] Requesting notification permission...')
      const perm = await requestNotificationPermission()
      console.log('[NotificationManager] Permission result:', perm)
      setPermission(perm)

      if (perm !== 'granted') {
        console.warn('[NotificationManager] Permission denied by user')
        alert('Notification permission denied. Please allow notifications in your browser settings.')
        setLoading(false)
        return
      }

      if (!VAPID_PUBLIC_KEY) {
        console.error('[NotificationManager] VAPID_PUBLIC_KEY is not set in environment')
        alert('VAPID public key not configured. Please contact the administrator.')
        setLoading(false)
        return
      }

      console.log('[NotificationManager] Subscribing to push notifications...')
      // Subscribe to push notifications
      const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY)
      console.log('[NotificationManager] Subscription result:', subscription ? 'Success ✅' : 'Failed ❌')

      if (!subscription) {
        console.error('[NotificationManager] subscribeToPushNotifications returned null')
        alert('Failed to subscribe to push notifications. Please check the browser console for details.')
        setLoading(false)
        return
      }

      console.log('[NotificationManager] Sending subscription to server...')
      console.log('[NotificationManager] Subscription endpoint:', subscription.endpoint)
      
      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      })

      console.log('[NotificationManager] Server response status:', response.status)
      console.log('[NotificationManager] Server response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[NotificationManager] Server error:', errorData)
        
        // If unauthorized, subscription is created but not saved to server yet
        // This is fine - it will be saved when user logs in next time
        if (response.status === 401) {
          console.warn('[NotificationManager] User not authenticated. Subscription created locally but not saved to server.')
          setSubscribed(true)
          setShowBanner(false)
          
          await showLocalNotification('Notifications Enabled!', {
            body: 'You will receive task reminders after logging in',
            icon: '/icon-192.png',
          })
          
          setLoading(false)
          return
        }
        
        throw new Error(`Failed to save subscription: ${errorData.error || response.statusText}`)
      }

      const responseData = await response.json()
      console.log('[NotificationManager] Server response data:', responseData)

      setSubscribed(true)
      setShowBanner(false)

      console.log('[NotificationManager] Showing test notification...')
      // Show a test notification
      await showLocalNotification('Notifications Enabled!', {
        body: 'You will now receive task reminders',
        icon: '/icon-192.png',
      })
      
      console.log('[NotificationManager] ✅ Notification setup complete!')
    } catch (error) {
      console.error('[NotificationManager] ❌ Error enabling notifications:', error)
      console.error('[NotificationManager] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to enable notifications:\n\n${errorMessage}\n\nPlease check the browser console for more details.`)
    } finally {
      console.log('[NotificationManager] Cleaning up, setting loading to false')
      setLoading(false)
    }
  }

  async function handleDisableNotifications() {
    setLoading(true)

    try {
      // Unsubscribe from push notifications
      await unsubscribeFromPushNotifications()

      // Remove subscription from server
      const subscription = await getCurrentSubscription()
      if (subscription) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      }

      setSubscribed(false)
    } catch (error) {
      console.error('Error disabling notifications:', error)
      alert('Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  // Don't render until mounted to prevent hydration errors
  if (!mounted || !supported) {
    return null
  }

  return (
    <>
      {/* Notification permission banner */}
      {showBanner && permission === 'default' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center flex-1">
                <Bell className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Enable notifications to get reminders for task due dates and execution dates
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enabling...' : 'Enable'}
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-blue-500 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification toggle in settings/profile */}
      {permission === 'granted' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {subscribed ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Task Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subscribed
                    ? 'Receiving reminders for task due dates'
                    : 'Notifications are disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={subscribed ? handleDisableNotifications : handleEnableNotifications}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                subscribed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : subscribed ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Export with no SSR to prevent hydration issues
export default dynamic(() => Promise.resolve(NotificationManagerContent), {
  ssr: false,
})
