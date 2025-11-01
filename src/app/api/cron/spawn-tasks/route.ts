import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for cron operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the spawn_recurring_tasks function
    const { data, error } = await supabase.rpc('spawn_recurring_tasks')

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Recurring tasks spawned successfully',
      result: data 
    })
  } catch (error: any) {
    console.error('Error spawning recurring tasks:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
