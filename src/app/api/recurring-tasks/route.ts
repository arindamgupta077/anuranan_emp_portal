import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is CEO
    const { data: userData } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', session.user.id)
      .single()

    if (!userData || (userData.role as any)?.name !== 'CEO') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, frequency, day_of_week, day_of_month, start_date, end_date, assigned_to } = body

    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({
        title,
        description,
        frequency,
        day_of_week,
        day_of_month,
        start_date,
        end_date,
        assigned_to,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating recurring task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is CEO
    const { data: userData } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', session.user.id)
      .single()

    if (!userData || (userData.role as any)?.name !== 'CEO') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, is_active } = body

    const { data, error } = await supabase
      .from('recurring_tasks')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating recurring task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
