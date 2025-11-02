import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { comment, updated_by } = body

    // Verify that the user is the assigned person for this task
    const { data: task } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', params.id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.assigned_to !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - Only assigned employee can add comments' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        comment,
        updated_by,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
