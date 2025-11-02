import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import TasksClient from './TasksClient'

// Dynamic rendering to ensure fresh data after mutations
export const dynamic = 'force-dynamic'
// Disable caching for this page to show immediate updates
export const revalidate = 0

export default async function TasksPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = await createServerClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*), profile_photo_url')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const isCEO = user.role.name === 'CEO'

  // Build tasks query - fetch ALL tasks (no status filter on server)
  let tasksQuery = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:users!assigned_to(id, full_name, email, profile_photo_url),
      created_user:users!created_by(id, full_name, profile_photo_url)
    `)
    .order('due_date', { ascending: true, nullsFirst: true })

  if (!isCEO) {
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }

  // Fetch tasks and employees in parallel for CEO
  let tasks: any[] = []
  let employees: any[] = []
  
  if (isCEO) {
    const [tasksResult, employeesResult] = await Promise.all([
      tasksQuery,
      supabase
        .from('users')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name')
    ])
    tasks = tasksResult.data || []
    employees = employeesResult.data || []
  } else {
    const { data } = await tasksQuery
    tasks = data || []
  }

  return (
    <ProtectedLayout user={user}>
      <TasksClient user={user} tasks={tasks} employees={employees} />
    </ProtectedLayout>
  )
}
