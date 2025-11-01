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
    const { title, details, assigned_to, due_date, created_by } = body

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        details,
        assigned_to,
        due_date,
        created_by,
        status: 'OPEN',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')?.split(',')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:users!assigned_to(id, full_name, email),
        created_user:users!created_by(id, full_name)
      `)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (status && status.length > 0) {
      query = query.in('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
