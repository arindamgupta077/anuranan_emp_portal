// Notification utilities for push notifications
export interface NotificationPermissionState {
  permission: NotificationPermission
  supported: boolean
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Get current notification permission state
 */
export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  if (!isPushNotificationSupported()) {
    return {
      permission: 'denied',
      supported: false,
    }
  }

  return {
    permission: Notification.permission,
    supported: true,
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Convert a base64 string to Uint8Array (for VAPID public key)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  publicVapidKey: string
): Promise<PushSubscriptionData | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported')
  }

  const registration = await navigator.serviceWorker.ready
  
  try {
    const convertedKey = urlBase64ToUint8Array(publicVapidKey)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey as BufferSource,
    })

    const subscriptionJSON = subscription.toJSON()
    
    if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
      throw new Error('Invalid subscription')
    }

    return {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || '',
      },
    }
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscriptionData | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      return null
    }

    const subscriptionJSON = subscription.toJSON()
    
    if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
      return null
    }

    return {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || '',
      },
    }
  } catch (error) {
    console.error('Failed to get current subscription:', error)
    return null
  }
}

/**
 * Show a local notification (for testing)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isPushNotificationSupported()) {
    throw new Error('Notifications are not supported')
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted')
  }

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  })
}
