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

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all active employees
    const { data: employees, error } = await supabase
      .from('users')
      .select('id, full_name, email, role:roles(name)')
      .eq('is_active', true)
      .order('full_name')

    if (error) throw error

    return NextResponse.json(employees || [])
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

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
    const { full_name, email, password, role_id } = body

    // Create auth user with metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError) throw authError

    // Update user record (created by trigger) with the correct role and details
    // Use admin client to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name,
        role_id,
        is_active: true,
      })
      .eq('id', authData.user.id)
      .select('*, role:roles(*)')
      .single()

    if (error) {
      console.error('Error updating user record:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Employee created successfully',
      data 
    })
  } catch (error: any) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
