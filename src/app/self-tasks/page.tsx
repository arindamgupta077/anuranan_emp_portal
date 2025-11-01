import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import SelfTasksClient from './SelfTasksClient'

export default async function SelfTasksPage() {
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

  // Fetch self tasks
  let selfTasksQuery = supabase
    .from('self_tasks')
    .select('*, user:users(id, full_name, email)')
    .order('task_date', { ascending: false })

  if (!isCEO) {
    selfTasksQuery = selfTasksQuery.eq('user_id', user.id)
  }

  const { data: selfTasks } = await selfTasksQuery

  // Fetch all employees for CEO filter
  let employees: any[] = []
  if (isCEO) {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name')
    employees = data || []
  }

  return (
    <ProtectedLayout user={user}>
      <SelfTasksClient user={user} selfTasks={selfTasks || []} employees={employees} />
    </ProtectedLayout>
  )
}
