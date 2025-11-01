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
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const isCEO = user.role.name === 'CEO'

  // Get filter status
  const statusFilter = searchParams.status?.split(',') || ['OPEN', 'IN_PROGRESS']

  // Build tasks query
  let tasksQuery = supabase
    .from('tasks')
    .select(`
      *,
      assigned_user:users!assigned_to(id, full_name, email),
      created_user:users!created_by(id, full_name)
    `)
    .in('status', statusFilter)
    .order('due_date', { ascending: true, nullsFirst: false })

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
