import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
const webpush = require('web-push')

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  url?: string
  taskId?: string
  type?: string
  tag?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Verify this is an internal/cron request
    // You should add proper authentication here
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, notification } = body as { userId: string; notification: NotificationPayload }

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions found for user' },
        { status: 200 }
      )
    }

    // Configure web-push with VAPID details
    webpush.setVapidDetails(
      'mailto:' + process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    // Send push notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        }
        
        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notification)
        )
      })
    )

    // Clean up failed subscriptions (invalid/expired)
    const failedIndices = results
      .map((result, index) => result.status === 'rejected' ? index : -1)
      .filter(index => index !== -1)
    
    for (const index of failedIndices) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptions[index].id)
    }

    const successCount = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successCount}/${subscriptions.length} subscription(s)`,
      sent: successCount,
      failed: failedIndices.length,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
