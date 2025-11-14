import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Daily cron job to check for tasks due today and send notifications
 * This should be called daily at a specific time (e.g., 8 AM)
 * 
 * Set up in Netlify or Vercel:
 * - Netlify: Use Scheduled Functions
 * - Vercel: Use Cron Jobs in vercel.json
 * 
 * Example vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/notifications/cron/daily",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Find all tasks with due_date or execution_date matching today
    // that are not completed
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        execution_date,
        status,
        assigned_to,
        assigned_user:users!tasks_assigned_to_fkey(id, email, display_name)
      `)
      .neq('status', 'COMPLETED')
      .or(`due_date.eq.${todayStr},execution_date.eq.${todayStr}`)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    if (!tasksData || tasksData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks due today',
        count: 0,
      })
    }

    // Group tasks by user
    const tasksByUser = new Map<string, any[]>()
    
    for (const task of tasksData) {
      if (task.assigned_to) {
        if (!tasksByUser.has(task.assigned_to)) {
          tasksByUser.set(task.assigned_to, [])
        }
        tasksByUser.get(task.assigned_to)!.push(task)
      }
    }

    // Send notifications to each user
    const notificationPromises = Array.from(tasksByUser.entries()).map(
      async ([userId, userTasks]) => {
        // Send a summary notification if user has multiple tasks
        const taskCount = userTasks.length
        const firstTask = userTasks[0]
        
        let notificationBody = ''
        let notificationTitle = ''
        
        if (taskCount === 1) {
          const dateType = firstTask.execution_date === todayStr 
            ? 'execution date' 
            : 'due date'
          notificationTitle = `Task ${dateType} today`
          notificationBody = `"${firstTask.title}" is ${dateType === 'execution date' ? 'scheduled to be executed' : 'due'} today`
        } else {
          notificationTitle = `${taskCount} tasks today`
          notificationBody = `You have ${taskCount} tasks due or scheduled for execution today`
        }

        // Call the send notification API
        const sendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cronSecret}`,
            },
            body: JSON.stringify({
              userId,
              notification: {
                title: notificationTitle,
                body: notificationBody,
                icon: '/icon-192.png',
                url: '/tasks',
                type: 'task-reminder',
                tag: `tasks-${todayStr}`,
              },
            }),
          }
        )

        return {
          userId,
          taskCount,
          success: sendResponse.ok,
        }
      }
    )

    const results = await Promise.allSettled(notificationPromises)
    const successCount = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({
      success: true,
      message: `Processed notifications for ${tasksByUser.size} user(s)`,
      tasksFound: tasksData.length,
      notificationsSent: successCount,
      details: results,
    })
  } catch (error) {
    console.error('Error in daily notification cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
