import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import SelfTasksClient from './SelfTasksClient'

// Dynamic rendering to ensure fresh data after mutations
export const dynamic = 'force-dynamic'
// Disable caching for this page to show immediate updates
export const revalidate = 0

export default async function SelfTasksPage() {
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

  // Build self tasks query
  let selfTasksQuery = supabase
    .from('self_tasks')
    .select('*, user:users(id, full_name, email, profile_photo_url)')
    .order('task_date', { ascending: false })

  if (!isCEO) {
    selfTasksQuery = selfTasksQuery.eq('user_id', user.id)
  }

  // Fetch self tasks and employees in parallel for CEO
  let selfTasks: any[] = []
  let employees: any[] = []

  if (isCEO) {
    const [selfTasksResult, employeesResult] = await Promise.all([
      selfTasksQuery,
      supabase
        .from('users')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name')
    ])
    selfTasks = selfTasksResult.data || []
    employees = employeesResult.data || []
  } else {
    const { data } = await selfTasksQuery
    selfTasks = data || []
  }

  return (
    <ProtectedLayout user={user}>
      <SelfTasksClient user={user} selfTasks={selfTasks} employees={employees} />
    </ProtectedLayout>
  )
}
