import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Admin client for user management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

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
    const { is_active } = body

    const { data, error } = await supabase
      .from('users')
      .update({ is_active })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating employee:', error)
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

    // Verify user is CEO
    const { data: userData } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', session.user.id)
      .single()

    if (!userData || (userData.role as any)?.name !== 'CEO') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent CEO from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete auth user (will cascade delete user record due to foreign key)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(params.id)

    if (authError) throw authError

    return NextResponse.json({ 
      success: true, 
      message: 'Employee deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
