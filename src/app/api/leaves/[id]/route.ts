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
    const { status, approved_by, start_date, end_date, reason } = body

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status !== 'PENDING') {
        updateData.approved_by = approved_by
        updateData.approved_at = new Date().toISOString()
      }
    }
    
    if (start_date) updateData.start_date = start_date
    if (end_date) updateData.end_date = end_date
    if (reason !== undefined) updateData.reason = reason

    const { data, error } = await supabase
      .from('leaves')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('leaves')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
