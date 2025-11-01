import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

export default async function ReportsPage() {
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

  if (!userData || (userData.role as any)?.name !== 'CEO') {
    redirect('/dashboard')
  }

  // Fetch all employees with role info
  const { data: employees } = await supabase
    .from('users')
    .select('id, full_name, email, status, role:roles(name)')
    .order('full_name')

  // Fetch tasks with completion info
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, assigned_to_user:users!assigned_to(id, full_name), created_by_user:users!created_by(id, full_name)')
    .order('created_at', { ascending: false })

  // Fetch self tasks
  const { data: selfTasks } = await supabase
    .from('self_tasks')
    .select('*, user:users(id, full_name)')
    .order('date', { ascending: false })

  // Fetch leaves
  const { data: leaves } = await supabase
    .from('leaves')
    .select('*, user:users(id, full_name)')
    .order('created_at', { ascending: false })

  return (
    <ProtectedLayout user={userData}>
      <ReportsClient
        employees={employees || []}
        tasks={tasks || []}
        selfTasks={selfTasks || []}
        leaves={leaves || []}
      />
    </ProtectedLayout>
  )
}
