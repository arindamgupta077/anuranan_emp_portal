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
  console.log('[subscribeToPushNotifications] Starting...')
  console.log('[subscribeToPushNotifications] VAPID key length:', publicVapidKey?.length || 0)
  
  if (!isPushNotificationSupported()) {
    console.error('[subscribeToPushNotifications] Push notifications not supported')
    throw new Error('Push notifications are not supported')
  }

  console.log('[subscribeToPushNotifications] Waiting for service worker to be ready...')
  const registration = await navigator.serviceWorker.ready
  console.log('[subscribeToPushNotifications] Service worker ready, scope:', registration.scope)
  
  try {
    console.log('[subscribeToPushNotifications] Converting VAPID key...')
    const convertedKey = urlBase64ToUint8Array(publicVapidKey)
    console.log('[subscribeToPushNotifications] VAPID key converted, length:', convertedKey.length)
    
    console.log('[subscribeToPushNotifications] Calling pushManager.subscribe...')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey as BufferSource,
    })
    console.log('[subscribeToPushNotifications] Subscription created successfully')

    const subscriptionJSON = subscription.toJSON()
    console.log('[subscribeToPushNotifications] Subscription JSON:', {
      hasEndpoint: !!subscriptionJSON.endpoint,
      hasKeys: !!subscriptionJSON.keys,
      endpointDomain: subscriptionJSON.endpoint?.split('/')[2]
    })
    
    if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
      console.error('[subscribeToPushNotifications] Invalid subscription - missing endpoint or keys')
      throw new Error('Invalid subscription')
    }

    console.log('[subscribeToPushNotifications] ✅ Subscription successful')
    return {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || '',
      },
    }
  } catch (error) {
    console.error('[subscribeToPushNotifications] ❌ Failed to subscribe:', error)
    console.error('[subscribeToPushNotifications] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack'
    })
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
