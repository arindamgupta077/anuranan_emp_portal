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
    const { start_date, end_date, reason, user_id } = body

    const { data, error } = await supabase
      .from('leaves')
      .insert({
        start_date,
        end_date,
        reason,
        user_id,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
