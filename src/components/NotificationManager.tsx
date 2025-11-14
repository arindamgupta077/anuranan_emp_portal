'use client'

import { useEffect, useState } from 'react'
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

export default function NotificationManager() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  async function checkNotificationStatus() {
    const state = await getNotificationPermissionState()
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
      // Request permission
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        alert('Notification permission denied')
        setLoading(false)
        return
      }

      if (!VAPID_PUBLIC_KEY) {
        alert('VAPID public key not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in environment variables.')
        setLoading(false)
        return
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY)

      if (!subscription) {
        alert('Failed to subscribe to push notifications')
        setLoading(false)
        return
      }

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setSubscribed(true)
      setShowBanner(false)

      // Show a test notification
      await showLocalNotification('Notifications Enabled!', {
        body: 'You will now receive task reminders',
        icon: '/icon-192.png',
      })
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert('Failed to enable notifications. Please try again.')
    } finally {
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

  if (!supported) {
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
