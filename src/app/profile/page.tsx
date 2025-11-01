import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

// Cache for 10 minutes with automatic revalidation
export const revalidate = 600
// Auto: Let Next.js decide based on request
export const fetchCache = 'default-cache'

export default async function ProfilePage() {
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

  if (!userData) {
    redirect('/login')
  }

  // Get user stats
  const { data: taskStats } = await supabase
    .from('tasks')
    .select('status')
    .eq('assigned_to', userData.id)

  const { data: selfTaskStats } = await supabase
    .from('self_tasks')
    .select('id')
    .eq('user_id', userData.id)

  const { data: leaveStats } = await supabase
    .from('leaves')
    .select('status')
    .eq('user_id', userData.id)

  const completedTasks = taskStats?.filter((t) => t.status === 'COMPLETED').length || 0
  const totalTasks = taskStats?.length || 0
  const totalSelfTasks = selfTaskStats?.length || 0
  const approvedLeaves = leaveStats?.filter((l) => l.status === 'APPROVED').length || 0

  return (
    <ProtectedLayout user={userData}>
      <ProfileClient
        user={userData}
        stats={{
          completedTasks,
          totalTasks,
          totalSelfTasks,
          approvedLeaves,
        }}
      />
    </ProtectedLayout>
  )
}
