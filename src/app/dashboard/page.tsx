import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import DashboardClient from './DashboardClient'

// Dynamic rendering to ensure fresh data after mutations
export const dynamic = 'force-dynamic'
// Disable caching for this page to show immediate updates
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    console.error('Auth error on dashboard:', authError)
    redirect('/login')
  }

  console.log('Dashboard - Auth User ID:', authUser.id, 'Email:', authUser.email)

  // Fetch user with role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (userError || !user) {
    console.error('User fetch error:', userError)
    console.error('Auth User ID used for query:', authUser.id)
    redirect('/login')
  }

  console.log('Dashboard - DB User:', user.full_name, 'Role:', user.role.name)

  const isCEO = user.role.name === 'CEO'

  // Build queries
  let tasksQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['OPEN', 'IN_PROGRESS'])

  if (!isCEO) {
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }

  let selfTasksQuery = supabase
    .from('self_tasks')
    .select('*', { count: 'exact', head: true })

  if (!isCEO) {
    selfTasksQuery = selfTasksQuery.eq('user_id', user.id)
  }

  let leavesQuery = supabase
    .from('leaves')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  if (!isCEO) {
    leavesQuery = leavesQuery.eq('user_id', user.id)
  }

  // Fetch all common queries in parallel
  const [
    { count: activeTasks },
    { count: selfTasksCount },
    { count: pendingLeaves }
  ] = await Promise.all([
    tasksQuery,
    selfTasksQuery,
    leavesQuery
  ])

  // CEO-specific stats - fetch in parallel
  let totalEmployees = 0
  let overdueTasksCount = 0
  let completionRate = 0

  if (isCEO) {
    const [
      { count: employeesCount },
      { count: overdue },
      { count: totalTasksCount },
      { count: completedTasksCount }
    ] = await Promise.all([
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'COMPLETED')
        .lt('due_date', new Date().toISOString().split('T')[0]),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'COMPLETED')
    ])

    totalEmployees = employeesCount || 0
    overdueTasksCount = overdue || 0
    
    if (totalTasksCount && totalTasksCount > 0) {
      completionRate = Math.round((completedTasksCount! / totalTasksCount) * 100)
    }
  }

  const stats = {
    activeTasks: activeTasks || 0,
    selfTasksCount: selfTasksCount || 0,
    pendingLeaves: pendingLeaves || 0,
    totalEmployees,
    overdueTasksCount,
    completionRate,
  }

  return (
    <ProtectedLayout user={user}>
      <DashboardClient user={user} stats={stats} />
    </ProtectedLayout>
  )
}
