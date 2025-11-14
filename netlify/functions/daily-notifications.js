import { schedule } from '@netlify/functions'

/**
 * Netlify Scheduled Function for Daily Task Notifications
 * Runs daily at 8:00 AM UTC
 * 
 * Schedule format: minute hour day month weekday
 * 0 8 * * * = Every day at 8:00 AM UTC
 */

const handler = async () => {
  try {
    const siteUrl = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'CRON_SECRET not configured' }),
      }
    }

    console.log(`Triggering daily notifications from ${siteUrl}`)

    const response = await fetch(
      `${siteUrl}/api/notifications/cron/daily`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    
    console.log('Notification cron result:', data)

    return {
      statusCode: response.ok ? 200 : response.status,
      body: JSON.stringify({
        success: response.ok,
        result: data,
        timestamp: new Date().toISOString(),
      }),
    }
  } catch (error) {
    console.error('Error in scheduled function:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to trigger notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

// Schedule to run daily at 8:00 AM UTC
// You can change this schedule as needed:
// - "0 9 * * *" = 9 AM daily
// - "0 8,17 * * *" = 8 AM and 5 PM daily
// - "0 8 * * 1-5" = 8 AM on weekdays only
export const dailyNotifications = schedule('0 8 * * *', handler)
