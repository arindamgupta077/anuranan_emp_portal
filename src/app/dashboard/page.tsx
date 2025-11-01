import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch user with role
  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const isCEO = user.role.name === 'CEO'

  // Fetch dashboard stats
  const tasksQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['OPEN', 'IN_PROGRESS'])

  if (!isCEO) {
    tasksQuery.eq('assigned_to', user.id)
  }

  const { count: activeTasks } = await tasksQuery

  // Get self tasks count
  const selfTasksQuery = supabase
    .from('self_tasks')
    .select('*', { count: 'exact', head: true })

  if (!isCEO) {
    selfTasksQuery.eq('user_id', user.id)
  }

  const { count: selfTasksCount } = await selfTasksQuery

  // Get pending leaves
  const leavesQuery = supabase
    .from('leaves')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  if (!isCEO) {
    leavesQuery.eq('user_id', user.id)
  }

  const { count: pendingLeaves } = await leavesQuery

  // CEO-specific stats
  let totalEmployees = 0
  let overdueTasksCount = 0
  let completionRate = 0

  if (isCEO) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    totalEmployees = count || 0

    const { count: overdue } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'COMPLETED')
      .lt('due_date', new Date().toISOString().split('T')[0])
    overdueTasksCount = overdue || 0

    const { count: totalTasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })

    const { count: completedTasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED')

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
