import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { task_date, details, visibility, user_id } = body

    const { data, error } = await supabase
      .from('self_tasks')
      .insert({
        task_date,
        details,
        visibility,
        user_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating self task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
