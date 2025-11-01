import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

// Disable cache for profile page to always show latest data including profile photo
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name, is_active, profile_photo_url, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!userData) {
    redirect('/login')
  }

  // Map user data with status
  const userWithStatus = {
    ...userData,
    status: userData.is_active ? 'ACTIVE' : 'INACTIVE',
    role: Array.isArray(userData.role) ? userData.role[0] : userData.role
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
    <ProtectedLayout user={userWithStatus}>
      <ProfileClient
        user={userWithStatus}
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
