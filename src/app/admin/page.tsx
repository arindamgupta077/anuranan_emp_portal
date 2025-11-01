import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!userData || userData.role?.name !== 'CEO') {
    redirect('/dashboard')
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .order('full_name')

  // Fetch all roles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name')

  // Fetch recurring tasks
  const { data: recurringTasks } = await supabase
    .from('recurring_tasks')
    .select('*, assigned_to_user:users!assigned_to(id, full_name)')
    .order('created_at', { ascending: false })

  return (
    <ProtectedLayout user={userData}>
      <AdminClient
        employees={employees || []}
        roles={roles || []}
        recurringTasks={recurringTasks || []}
      />
    </ProtectedLayout>
  )
}
